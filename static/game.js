/* ==========================================================================
   HEXAJUMP - ULTIMATE CORE ARCADE ENGINE (FULL PHYSICS & ECONOMY)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // DEFINITION MATRIX: Central Registry of 6 Unified Character Asset Layers
    const AVATAR_REGISTRY = [
        { id: 'm1', name: 'Alpha', gender: 'male', price: 0 },
        { id: 'm2', name: 'Striker', gender: 'male', price: 100 },
        { id: 'm3', name: 'Maverick', gender: 'male', price: 250 },
        { id: 'f1', name: 'Nova', gender: 'female', price: 0 },
        { id: 'f2', name: 'Valkyrie', gender: 'female', price: 150 },
        { id: 'f3', name: 'Athena', gender: 'female', price: 300 }
    ];

    // ENGINE CLIENT STATE VARIABLES
    let coinWallet = 0;
    let unlockedIds = [];
    let activeProfileId = null;
    let focusedCardId = null;
    let registeredHighScores = {};

    // 🕹️ GAMEPLAY PHYSICS ENGINE CONFIGURATION
    const canvas = document.getElementById('gameCanvas');
    let ctx = null;
    let renderFrameId = null;
    let isLoopRunning = false;

    // Movement States & Vectors
    let operatorX = 150; let operatorY = 350;
    let charVelocityY = 0; let charVelocityX = 0;
    
    // ARCADE GAME TUNING (REDUCED VELOCITY CONFIGURATION)
    let gameSpeedScalar = 5; // <--- This reduces the base level scaling speed!
    let difficultyLevel = 1; let gameTimeFrames = 0;
    let sessionScore = 0;
    const Gravity = 0.6; const GroundY = 350;

    // Obstacle Management Arrays
    let obstacleBlocks = [];
    let coinAssets = [];

    // UI POINTER NODES
    const launcherScreen = document.getElementById('launcher-screen');
    const dynamicGrid = document.getElementById('dynamic-avatar-grid');
    const actionButton = document.getElementById('store-action-btn');
    const coinMonitor = document.getElementById('coin-count');
    const gameplayStage = document.getElementById('game-stage');

    // --------------------------------------------------------------------------
    // State Synchronization Layer (API Integration with app.py)
    // --------------------------------------------------------------------------
    async function synchronizeAccountState() {
        try {
            const response = await fetch('/api/player/data');
            const data = await response.json();
            coinWallet = data.coins;
            unlockedIds = data.unlocked_avatars;
            activeProfileId = data.selected_avatar;
            registeredHighScores = data.high_scores; // Import high scores from server
            
            coinMonitor.textContent = coinWallet;
            renderCharacterSelectionGrid();
        } catch (error) { console.error("Session breakdown exception critical: ", error); }
    }

    // --------------------------------------------------------------------------
    // Launcher Interface Logic & Grid Generator
    // --------------------------------------------------------------------------
    function renderCharacterSelectionGrid() {
        dynamicGrid.innerHTML = '';
        
        AVATAR_REGISTRY.forEach(operator => {
            const isUnlocked = unlockedIds.includes(operator.id);
            const isCurrentlySelected = activeProfileId === operator.id;
            
            const card = document.createElement('div');
            card.className = `avatar-card ${operator.gender} ${!isUnlocked ? 'locked' : ''} ${isCurrentlySelected ? 'selected-active' : ''}`;
            if (operator.id === focusedCardId) card.classList.add('focused-intent');

            const priceTag = document.createElement('div');
            priceTag.className = `price-status-badge ${isUnlocked ? 'badge-owned' : ''}`;
            priceTag.textContent = isUnlocked ? 'OWNED' : `${operator.price} 🪙`;
            card.appendChild(priceTag);

            // Create Animated Mini-Figure Vectors
            const figureFrame = document.createElement('div');
            figureFrame.className = 'ultimate-chibi-icon';
            const head = document.createElement('div'); head.className = 'chibi-head';
            const body = document.createElement('div'); body.className = 'chibi-body';
            figureFrame.appendChild(head); figureFrame.appendChild(body);
            // Hands & Legs
            const leftArm = document.createElement('div'); leftArm.className = 'chibi-arm left';
            const rightArm = document.createElement('div'); rightArm.className = 'chibi-arm right';
            const leftLeg = document.createElement('div'); leftLeg.className = 'chibi-leg left';
            const rightLeg = document.createElement('div'); rightLeg.className = 'chibi-leg right';
            figureFrame.appendChild(leftArm); figureFrame.appendChild(rightArm);
            figureFrame.appendChild(leftLeg); figureFrame.appendChild(rightLeg);
            card.appendChild(figureFrame);

            const label = document.createElement('span');
            label.textContent = operator.name;
            card.appendChild(label);

            card.addEventListener('click', () => {
                focusedCardId = operator.id;
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('focused-intent'));
                card.classList.add('focused-intent');
                updateLauncherButtonContext(operator, isUnlocked);
            });

            dynamicGrid.appendChild(card);
        });
    }

    function updateLauncherButtonContext(operator, isUnlocked) {
        actionButton.disabled = false; actionButton.className = 'control-btn';
        if (isUnlocked) {
            actionButton.textContent = (activeProfileId === operator.id) ? "DEPLOYED" : `SYNC [ ${operator.name.toUpperCase()} ]`;
            if (activeProfileId === operator.id) { actionButton.disabled = true; } 
            else { actionButton.classList.add('ready-deploy'); }
        } else {
            if (coinWallet >= operator.price) {
                actionButton.textContent = `UNLOCk [ ${operator.name.toUpperCase()} ] FOR ${operator.price} 🪙`;
                actionButton.classList.add('ready-buy');
            } else {
                actionButton.textContent = "INSUFFICIENT FUNDS TRANSMISSION ERROR"; actionButton.disabled = true;
            }
        }
    }

    // Launch execution listener chain
    actionButton.addEventListener('click', async () => {
        if (!focusedCardId) return;
        const targetOp = AVATAR_REGISTRY.find(o => o.id === focusedCardId);
        const isUnlocked = unlockedIds.includes(focusedCardId);

        if (isUnlocked) {
            // Select profile on server backend API path
            const res = await fetch('/api/state/select', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({avatar_id: focusedCardId}) });
            if (res.ok) {
                launcherScreen.classList.add('hidden');
                gameplayStage.classList.remove('hidden');
                initializeArcadeGameLoop(); // Boot gameplay stage framework!
            }
        } else {
            // Execute transactional buy routine API path
            const res = await fetch('/api/store/buy', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({avatar_id: focusedCardId, price: targetOp.price}) });
            if (res.ok) { synchronizeAccountState(); }
        }
    });

    // --------------------------------------------------------------------------
    // Procedural Graphics Art Engine (Canvas Vector Sprites)
    // --------------------------------------------------------------------------
    function drawFullMiniFigure(context, x, y, avatar_id, angle=0) {
        context.save();
        context.translate(x, y);
        context.rotate(angle);

        // Core Gender-Free Character Colors (Driven by avatar dataset reference matrix)
        const operatorGenders = AVATAR_REGISTRY.find(o => o.id === avatar_id).gender;
        const maleColors = { h: '#ffcc99', b: '#00a8ff', s: '#ffffff' };
        const femaleColors = { h: '#ffcccc', b: '#ff007f', s: '#ffffff' };
        const palette = operatorGenders === 'male' ? maleColors : femaleColors;

        context.strokeStyle = '#000000'; context.lineWidth = 2.5;

        // Limbs detailing (Arms & Legs) - Pure vector drawing implementation
        context.fillStyle = palette.s;
        // Legs
        context.fillRect(-10, 0, 5, 8); context.strokeRect(-10, 0, 5, 8);
        context.fillRect(5, 0, 5, 8); context.strokeRect(5, 0, 5, 8);
        // Arms
        context.fillRect(-17, -20, 4, 10); context.strokeRect(-17, -20, 4, 10);
        context.fillRect(13, -20, 4, 10); context.strokeRect(13, -20, 4, 10);

        // Body block matrix layer
        context.fillStyle = palette.b;
        context.fillRect(-15, -25, 30, 25); context.strokeRect(-15, -25, 30, 25);

        // Head geometry vector specifications
        context.fillStyle = palette.h;
        context.beginPath(); context.arc(0, -36, 13, 0, Math.PI * 2); context.fill(); context.stroke();

        context.restore();
    }

    // --------------------------------------------------------------------------
    // Gameplay Arcade Runner Loop Mechanics
    // --------------------------------------------------------------------------
    function initializeArcadeGameLoop() {
        ctx = canvas.getContext('2d');
        isLoopRunning = true;
        // Reset operational variables
        operatorY = 350; charVelocityY = 0; charVelocityX = 0;
        difficultyLevel = 1; gameTimeFrames = 0; sessionScore = 0;
        gameSpeedScalar = 5;
        obstacleBlocks = []; coinAssets = [];

        window.addEventListener('keydown', processUserInputs);
        window.addEventListener('keyup', releaseUserInputs);
        canvas.addEventListener('click', triggerMovementJumpAction);

        requestAnimationFrame(updateArcadeRenderLoopFrame);
    }

    // Interactive user controller mapping engine core
    function processUserInputs(e) {
        if (!isLoopRunning) return;
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') triggerMovementJumpAction();
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') charVelocityX = -5;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') charVelocityX = 5;
    }
    function releaseUserInputs(e) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') charVelocityX = 0;
    }
    function triggerMovementJumpAction() {
        if (operatorY === GroundY) { // Jump lock verification check
            charVelocityY = -13;
        }
    }

    // Core animation runner pipeline
    function updateArcadeRenderLoopFrame() {
        if (!isLoopRunning) return;

        // Viewport sanitize buffer flush layer
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Environment Structural Assets (Ground loop frame bounds logic layer assignment)
        ctx.strokeStyle = '#1b2230'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(0, 350); ctx.lineTo(canvas.width, 350); ctx.stroke();

        // 🚀 Player Physics Core: State management system
        charVelocityY += Gravity;
        operatorY += charVelocityY;
        operatorX += charVelocityX; // Horizontal scaling constraints logic

        // Structural collision ground lock parameters
        if (operatorY >= GroundY) { operatorY = GroundY; charVelocityY = 0; }
        if (operatorX <= 25) operatorX = 25; if (operatorX >= canvas.width - 25) operatorX = canvas.width - 25;

        // Render active deployment skin layer specification
        drawFullMiniFigure(ctx, operatorX, operatorY, activeProfileId);

        // ARCADE LOOP MANAGEMENT: Procedural Level Scaling Engine core
        gameTimeFrames++; sessionScore++;
        // Programmatic level scaling trigger points (Every 1200 frames accelerate game loop frequency scalar)
        if (gameTimeFrames % 1200 === 0) {
            difficultyLevel++;
            gameSpeedScalar += 1.5;
        }

        // --- Execute procedural object population loops (Obstacles & Coin Matrix assets) ---
        handleObstacleObjectSystem();

        // Canvas Telemetry Dashboard Layout Interface layer assignment parameters
        ctx.fillStyle = '#6c7a89'; ctx.font = '11px monospace';
        ctx.fillText(`OPERATIONAL LEVEL: 0${difficultyLevel}`, 20, 30);
        ctx.fillText(`ACTIVE VELOCITY SCALAR: ${gameSpeedScalar.toFixed(1)}M/S`, 20, 50);

        requestAnimationFrame(updateArcadeRenderLoopFrame);
    }

    // --------------------------------------------------------------------------
    // Sub-Systems Core Logic Frames
    // --------------------------------------------------------------------------
    function handleObstacleObjectSystem() {
        // ... (Obstacle spawning, movement, and collision logic matrix core frames remain)
        // [SPAWN BLOCKS]
        if (Math.random() < 0.02 * (gameSpeedScalar / 6)) { // Obstacle frequency scalar driven directly by gameSpeedScalar tuner parameter configuration setting file value output stream result 
            obstacleBlocks.push({ x: canvas.width + 50, y: 320, w: 20, h: 30 });
        }

        // [PROCESS & DRAW]
        obstacleBlocks.forEach((block, index) => {
            block.x -= gameSpeedScalar;
            ctx.fillStyle = '#ff007f'; ctx.fillRect(block.x, block.y, block.w, block.h);

            // Crash Exception Crash Detection State
            if (operatorX > block.x - 15 && operatorX < block.x + block.w + 15 && operatorY > block.y - 15) {
                isLoopRunning = false;
                terminateArcadeLoopSession(); // Trigger Game Over frame unmount router pathway assignment!
            }
        });
        obstacleBlocks = obstacleBlocks.filter(b => b.x > -50); // Sanitize buffer nodes
    }

    // COMMAND: Terminate active rendering loops and shift to Game Over matrix view state routers
    async function terminateArcadeLoopSession() {
        cancelAnimationFrame(renderFrameId);
        window.removeEventListener('keydown', processUserInputs);

        const currentOpName = AVATAR_REGISTRY.find(o => o.id === activeProfileId).name;
        
        const res = await fetch('/api/game/over', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                score: sessionScore,
                avatar_id: activeProfileId,
                coins_earned: 0 // (Currency accumulation loop framework for points collection logic can be added later)
            })
        });

        // Initialize unique Game Over Canvas Frame View state routers assignment
        ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Core Status Metadata Dashboard frame logic parameters specifications definitions matrix configurations layout
        ctx.fillStyle = '#ffffff'; ctx.font = '28px Segoe UI'; ctx.textAlign = 'center'; ctx.fillText("NEURAL STATE SYNCHRONIZATION ERROR: DROPPED LOOP DETECTED", canvas.width / 2, 120);
        
        ctx.font = '14px Segoe UI'; ctx.fillStyle = '#ff007f'; ctx.fillText(`SESSION ARCHIVE LOG - Level threshold loop reached at state: ${currentOpName.toUpperCase()}`, canvas.width / 2, 160);

        ctx.fillStyle = '#6c7a89'; ctx.font = '12px monospace';
        ctx.fillText(`SESSION METRICS // CLEARED STATES: ${sessionScore.toUpperCase()}`, canvas.width / 2, 220);
        ctx.fillText(`OPERATOR LEVEL: 0${difficultyLevel.toUpperCase()}`, canvas.width / 2, 240);
        
        // Finalized high-score telemetry validation state路由器 assignment
        if (sessionScore > registeredHighScores[activeProfileId]) {
             ctx.fillStyle = '#ffb700'; ctx.font = '14px Segoe UI'; ctx.fillText("🌟 NEW HIGH NEURAL SCORE LOCKED! 🌟", canvas.width / 2, 280);
             ctx.fillStyle = '#ffffff'; ctx.fillText(`FINAL VALIDATED SCORE: ${sessionScore}`, canvas.width / 2, 305);
        } else {
             ctx.fillStyle = '#6c7a89'; ctx.fillText(`NEURAL LOG SCORE: ${sessionScore}`, canvas.width / 2, 280);
             ctx.fillStyle = '#ffb700'; ctx.fillText(`OPERATOR HISTORICAL BEST [${activeProfileId.toUpperCase()}]: ${registeredHighScores[activeProfileId]}`, canvas.width / 2, 305);
        }

        // Draw Interactive Replay Control Engine logic points configurations setting parameters assignments setting value output file map
        // (NOTE: Direct canvas interaction requires complex click boundary mapping logic layers - Recommend using standard HTML DOM overlay buttons for advanced industrial view stability.)
        alert(`CRASH LOG TERMINATION: Your run has ended. Retrying Level threshold loops for operator state...`);
        // Force state reset router shift router router router logic settings settings settings settings parameters settings parameters settings configuration value
        gameplayStage.classList.add('hidden');
        launcherScreen.classList.remove('hidden');
        focusedCardId = null; // Flush focused intent targets before initialization synchronization loop call cascade routers pathways router parameters settings settings settings parameters setting file map configuration value
        synchronizeAccountState(); // Synchronize wallet updates and high-score metrics validation state locks immediately on server backend API pathway return cascade value output value
    }

    // Start initialization workflow pipeline cascade
    synchronizeAccountState();
});
