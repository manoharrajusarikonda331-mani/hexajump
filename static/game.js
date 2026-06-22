/* ==========================================================================
   HEXAJUMP - CORE CLIENT APPLICATION ENGINE LOOP (DATA-DRIVEN)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // DATA LAYER: Centralized Character Specifications Definition Matrix
    const AVATAR_REGISTRY = [
        { id: 'm1', name: 'Alpha', gender: 'male', colorPrimary: '#007fff', colorSecondary: '#00f0ff', shape: 'square', price: 0 },
        { id: 'm2', name: 'Striker', gender: 'male', colorPrimary: '#1034a6', colorSecondary: '#00a8ff', shape: 'triangle', price: 100 },
        { id: 'm3', name: 'Maverick', gender: 'male', colorPrimary: '#009944', colorSecondary: '#00ff88', shape: 'circle', price: 250 },
        { id: 'f1', name: 'Nova', gender: 'female', colorPrimary: '#ff1493', colorSecondary: '#ff007f', shape: 'circle', price: 0 },
        { id: 'f2', name: 'Valkyrie', gender: 'female', colorPrimary: '#4b0082', colorSecondary: '#b500ff', shape: 'triangle', price: 150 },
        { id: 'f3', name: 'Athena', gender: 'female', colorPrimary: '#cc0000', colorSecondary: '#ff4500', shape: 'square', price: 300 }
    ];

    // CLIENT ENGINE STATE VARIABLES
    let playerWallet = 0;
    let unlockedList = [];
    let activeSelectionId = null;
    let focusedCardId = null;

    // RUNTIME CANVAS GAMEPLAY PHYSICS PROPERTIES
    const canvas = document.getElementById('gameCanvas');
    let ctx = null;
    let animationFrameId = null;
    let running = false;

    let characterY = 350;
    let characterVelocity = 0;
    let scoreMultiplier = 0;
    let obstacleX = 850;
    
    // GAMEPLAY MECHANICAL TUNERS (LEVEL SCALING CONFIGURATION)
    let gameSpeed = 6;
    let currentLevel = 1;
    const gravityValue = 0.6;

    // DOM UI POINTER NODES
    const gridContainer = document.getElementById('dynamic-avatar-grid');
    const coinCounter = document.getElementById('player-coins');
    const storeActionButton = document.getElementById('store-action-btn');
    const launcherScreen = document.getElementById('launcher-screen');
    const gameStage = document.getElementById('game-stage');

    // --------------------------------------------------------------------------
    // SYSTEM DATABASE DATA SYNCHRONIZATION (API CORE FETCH CALLS)
    // --------------------------------------------------------------------------
    async function synchronizeEngineState() {
        try {
            const response = await fetch('/api/player/data');
            const data = await response.json();
            
            playerWallet = data.coins;
            activeSelectionId = data.selected_avatar;
            unlockedList = data.unlocked_avatars;

            coinCounter.textContent = playerWallet;
            renderStoreGridMenu();
        } catch (err) {
            console.error("System critical initialization breakdown: ", err);
        }
    }

    // --------------------------------------------------------------------------
    // INTERFACE WORKFLOW DYNAMIC DOM GENERATOR
    // --------------------------------------------------------------------------
    function renderStoreGridMenu() {
        gridContainer.innerHTML = ''; // Sanitize container bounds
        
        AVATAR_REGISTRY.forEach(char => {
            const isUnlocked = unlockedList.includes(char.id);
            const isCurrentlyActive = activeSelectionId === char.id;
            
            const card = document.createElement('div');
            card.className = `avatar-card ${!isUnlocked ? 'locked' : ''} ${isCurrentlyActive ? 'selected-active' : ''}`;
            if(char.id === focusedCardId) card.classList.add('focused-intent');

            // Insert Price Flag Nodes
            const badge = document.createElement('div');
            badge.className = `price-tag ${isUnlocked ? 'unlocked-tag' : ''}`;
            badge.textContent = isUnlocked ? 'OWNED' : `${char.price} 🪙`;
            card.appendChild(badge);

            // Create Local Preview Icon Viewport Canvas Block
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 60; previewCanvas.height = 60;
            const pCtx = previewCanvas.getContext('2d');
            drawAvatarVector(pCtx, 30, 45, char, false); // Draw avatar stationary inside preview
            card.appendChild(previewCanvas);

            // Add Text Metadata Name Labels
            const label = document.createElement('span');
            label.className = 'avatar-name';
            label.textContent = char.name;
            card.appendChild(label);

            // Interactive Event Trigger Handlers
            card.addEventListener('click', () => {
                focusedCardId = char.id;
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('focused-intent'));
                card.classList.add('focused-intent');
                updateActionButtonState(char, isUnlocked);
            });

            gridContainer.appendChild(card);
        });
    }

    function updateActionButtonState(char, isUnlocked) {
        storeActionButton.disabled = false;
        storeActionButton.className = 'control-btn';

        if (isUnlocked) {
            storeActionButton.textContent = (activeSelectionId === char.id) ? "DEPLOYED" : `SYNC [ ${char.name.toUpperCase()} ]`;
            storeActionButton.classList.add('ready-select');
            if(activeSelectionId === char.id) storeActionButton.disabled = true;
        } else {
            if (playerWallet >= char.price) {
                storeActionButton.textContent = `PURCHASE [ ${char.name.toUpperCase()} ]`;
                storeActionButton.classList.add('ready-buy');
            } else {
                storeActionButton.textContent = "INSUFFICIENT BALANCE";
                storeActionButton.disabled = true;
            }
        }
    }

    // Action Trigger Routing Listener Matrix
    storeActionButton.addEventListener('click', async () => {
        if (!focusedCardId) return;
        const targetAvatar = AVATAR_REGISTRY.find(c => c.id === focusedCardId);
        const isUnlocked = unlockedList.includes(focusedCardId);

        if (isUnlocked) {
            // Select execution pathway
            const res = await fetch('/api/state/select', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_id: focusedCardId })
            });
            if (res.ok) {
                // Boot launcher directly into live execution viewport stage!
                launcherScreen.classList.add('hidden');
                gameStage.classList.remove('hidden');
                initializeGameplaySession();
            }
        } else {
            // Purchase transaction execution pathway
            const res = await fetch('/api/store/buy', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_id: focusedCardId, price: targetAvatar.price })
            });
            if (res.ok) {
                focusedCardId = null;
                storeActionButton.disabled = true;
                storeActionButton.textContent = "SELECT PROFILE";
                synchronizeEngineState();
            }
        }
    });

    // --------------------------------------------------------------------------
    // DYNAMIC PROCEDURAL CANVAS PROCEDURAL ART ENGINE
    // --------------------------------------------------------------------------
    function drawAvatarVector(context, x, y, char, animate = false) {
        context.save();
        
        // Render simple animation squash bounce offsets if requested
        let bounceOffset = 0;
        if (animate) {
            bounceOffset = Math.sin(Date.now() * 0.01) * 3;
        }

        context.fillStyle = char.colorPrimary;
        context.strokeStyle = '#000000';
        context.lineWidth = 3;

        // 1. Vector Body Execution Node
        context.beginPath();
        context.moveTo(x - 15, y);
        context.lineTo(x + 15, y);
        context.lineTo(x + 10, y - 25 + bounceOffset);
        context.lineTo(x - 10, y - 25 + bounceOffset);
        context.closePath();
        context.fill(); context.stroke();

        // 2. Vector Head & Geometry Asset Customization Layers
        context.fillStyle = char.colorSecondary;
        const headY = y - 38 + bounceOffset;

        context.beginPath();
        if (char.shape === 'square') {
            context.rect(x - 12, headY - 12, 24, 24);
        } else if (char.shape === 'triangle') {
            context.moveTo(x, headY - 14);
            context.lineTo(x + 14, headY + 12);
            context.lineTo(x - 14, headY + 12);
            context.closePath();
        } else {
            context.arc(x, headY, 13, 0, Math.PI * 2);
        }
        context.fill(); context.stroke();

        // 3. Hands & Legs Detail Layout (Adding requested full character anatomy fields)
        context.fillStyle = '#ffffff';
        // Left/Right Legs
        context.fillRect(x - 10, y, 5, 8);
        context.fillRect(x + 5, y, 5, 8);
        // Hands
        context.fillRect(x - 18, y - 20 + bounceOffset, 4, 10);
        context.fillRect(x + 14, y - 20 + bounceOffset, 4, 10);

        context.restore();
    }

    // --------------------------------------------------------------------------
    // ARCADE GAMEPLAY RUNTIME RUNNER ENGINE (DYNAMIC SCALING JUMP LOOP)
    // --------------------------------------------------------------------------
    function initializeGameplaySession() {
        ctx = canvas.getContext('2d');
        running = true;
        characterY = 350;
        characterVelocity = 0;
        obstacleX = 850;
        gameSpeed = 6;
        currentLevel = 1;
        scoreMultiplier = 0;

        window.addEventListener('keydown', handleJumpTrigger);
        canvas.addEventListener('click', executeJumpAction);
        
        animationFrameId = requestAnimationFrame(executeGameLoopUpdateFrame);
    }

    function handleJumpTrigger(e) { if (e.code === 'Space') executeJumpAction(); }
    function executeJumpAction() {
        if (characterY === 350) { // Verify ground lock lock to clear double-jumping exceptions
            characterVelocity = -13;
        }
    }

    function executeGameLoopUpdateFrame() {
        if (!running) return;

        // Clear Viewport Screen Layout
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Process Ground Environment Structural Borders
        ctx.strokeStyle = '#1a222d'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 350); ctx.lineTo(canvas.width, 350); ctx.stroke();

        // 2. Physics Execution Mechanics: Fall and Jump States
        characterVelocity += gravityValue;
        characterY += characterVelocity;
        if (characterY >= 350) { characterY = 350; characterVelocity = 0; }

        // Fetch active metadata parameters to render your chosen skin
        const activeUserCharacter = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        drawAvatarVector(ctx, 150, characterY, activeUserCharacter, true);

        // 3. Game Difficulty Scaling Logic Matrix (Infinite Level Looping Engine)
        scoreMultiplier++;
        if (scoreMultiplier % 500 === 0) { // Every 500 frames, speed up and shift levels
            currentLevel++;
            gameSpeed += 1.5; // Scale speed variable programmatically
        }

        // Move obstacle items seamlessly across views
        obstacleX -= gameSpeed;
        if (obstacleX < -30) { obstacleX = 850; }

        // Draw obstacle blocks
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(obstacleX, 320, 20, 30);

        // 4. Hitbox Collision Crash Detection Core
        if (obstacleX > 135 && obstacleX < 165 && characterY > 295) {
            // Player hit! Reset to the beginning of the level without full progress erasure
            obstacleX = 850;
            characterVelocity = 0;
            characterY = 350;
            alert(`CRASH EXCEPTION DETECTED! Level Loop ${currentLevel} Resetting...`);
        }

        // Render live system performance telemetry dashboards
        ctx.fillStyle = '#6c7a89'; ctx.font = '11px monospace';
        ctx.fillText(`OPERATOR LEVEL: 0${currentLevel}`, 25, 35);
        ctx.fillText(`VELOCITY CONFIG: ${gameSpeed.toFixed(1)}M/S`, 25, 55);

        animationFrameId = requestAnimationFrame(executeGameLoopUpdateFrame);
    }

    // Start systems operation pipeline
    synchronizeEngineState();
});
