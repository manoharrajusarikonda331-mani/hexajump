/* ==========================================================================
   HEXAJUMP - FULL STATE ENGINE & MULTI-SCREEN PIPELINE LOOP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // DEFINITION MATRIX: Central Character Registry Mapping to Local Assets
    const AVATAR_REGISTRY = [
        { id: 'm1', name: 'Alpha', gender: 'male', src: 'assets/alpha.png', price: 0 },
        { id: 'm2', name: 'Striker', gender: 'male', src: 'assets/striker.png', price: 100 },
        { id: 'm3', name: 'Maverick', gender: 'male', src: 'assets/maverick.png', price: 250 },
        { id: 'f1', name: 'Nova', gender: 'female', src: 'assets/nova.png', price: 0 },
        { id: 'f2', name: 'Valkyrie', gender: 'female', src: 'assets/valkyrie.png', price: 150 },
        { id: 'f3', name: 'Athena', gender: 'female', src: 'assets/athena.png', price: 300 }
    ];

    // DEFINITION MATRIX: 5 Distinct Environment Sectors
    const WORLD_MODES = {
        cyber: { name: "Cyber City Grid", skyColor: "#030712", floorColor: "#00f0ff" },
        jungle: { name: "Mystic Jungle", skyColor: "#021208", floorColor: "#00ff88" },
        volcano: { name: "Volcano Core", skyColor: "#1c0505", floorColor: "#ff4500" },
        space: { name: "Deep Space Void", skyColor: "#0b021c", floorColor: "#b500ff" },
        grid: { name: "Neon Retro Field", skyColor: "#0d0d0d", floorColor: "#ffffff" }
    };

    // SYSTEM ROUTING CORE STATE
    let coinWallet = 0; let unlockedList = [];
    let activeSelectionId = null; let focusedCardId = null;
    let designatedWorldMode = null;

    // PHYSICS & CANVAS CORE RUNTIME
    const canvas = document.getElementById('gameCanvas');
    let ctx = null; let renderFrameId = null;
    let isGameRunning = false; let isPaused = false;

    let characterY = 350; let velocityY = 0;
    let obstacleX = 850; let gameSpeed = 4.5; // Smooth reduced baseline speed

    // ANIMATION REGISTER (Handles realistic running stride)
    let strideFrameCounter = 0;

    // DOM NODE MAPPERS
    const loadingScreen = document.getElementById('loading-screen');
    const bootBar = document.getElementById('boot-progress');
    const telemetryBar = document.getElementById('top-telemetry-bar');
    const storeScreen = document.getElementById('store-screen');
    const gridContainer = document.getElementById('dynamic-avatar-grid');
    const storeActionButton = document.getElementById('store-action-btn');
    
    // Home View Elements
    const homeScreen = document.getElementById('home-screen');
    const hubAvatarImg = document.getElementById('hub-avatar-img');
    const hubAvatarName = document.getElementById('hub-avatar-name');
    
    // Mode Screen Elements
    const modesScreen = document.getElementById('modes-screen');
    const modeCards = document.querySelectorAll('.mode-card');
    const launchGameEngineBtn = document.getElementById('launch-game-engine-btn');

    // Gameplay Controls
    const gameStage = document.getElementById('game-stage');
    const pauseOverlay = document.getElementById('pause-overlay');

    // --------------------------------------------------------------------------
    // SCREEN 1: AUTOMATED BOOT LOADER progress SYSTEM
    // --------------------------------------------------------------------------
    function triggerBootLoaderSequence() {
        let currentProgress = 0;
        const loaderInterval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 2;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(loaderInterval);
                // System Boot Complete -> Fetch data and route to character selector
                loadingScreen.classList.add('hidden');
                telemetryBar.classList.remove('hidden');
                synchronizeSystemDatabase();
            }
            bootBar.style.width = `${currentProgress}%`;
        }, 60);
    }

    // --------------------------------------------------------------------------
    // STATE LAYER: DATABASE INTERFACE SYNCHRONIZATION
    // --------------------------------------------------------------------------
    async function synchronizeSystemDatabase() {
        try {
            const response = await fetch('/api/player/data');
            const data = await response.json();
            coinWallet = data.coins;
            unlockedList = data.unlocked_avatars;
            activeSelectionId = data.selected_avatar;

            document.getElementById('coin-count').textContent = coinWallet;
            
            // Initial routing checklist
            if (activeSelectionId) {
                routeToHomeCommandHub();
            } else {
                routeToAvatarSelectorStore();
            }
        } catch (err) { console.error("System connection failure: ", err); }
    }

    // --------------------------------------------------------------------------
    // SCREEN 2: DYNAMIC CUSTOMIZATION STORE LOGIC
    // --------------------------------------------------------------------------
    function routeToAvatarSelectorStore() {
        homeScreen.classList.add('hidden');
        storeScreen.classList.remove('hidden');
        renderStoreGridPanel();
    }

    function renderStoreGridPanel() {
        gridContainer.innerHTML = '';
        AVATAR_REGISTRY.forEach(char => {
            const isUnlocked = unlockedList.includes(char.id);
            const isActive = activeSelectionId === char.id;

            const card = document.createElement('div');
            card.className = `avatar-card ${isActive ? 'selected-active' : ''} ${!isUnlocked ? 'locked' : ''}`;
            if (char.id === focusedCardId) card.classList.add('focused-intent');

            // Embed artwork texture from repo assets folder
            const img = document.createElement('img');
            img.src = char.src;
            img.onerror = () => { img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24'><rect width='24' height='24' fill='%23222'/></svg>"; };
            card.appendChild(img);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'avatar-name';
            nameSpan.textContent = char.name;
            card.appendChild(nameSpan);

            card.addEventListener('click', () => {
                focusedCardId = char.id;
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('focused-intent'));
                card.classList.add('focused-intent');
                updateStoreActionBtn(char, isUnlocked);
            });

            gridContainer.appendChild(card);
        });
    }

    function updateStoreActionBtn(char, isUnlocked) {
        storeActionButton.disabled = false;
        storeActionButton.className = 'control-btn';
        if (isUnlocked) {
            storeActionButton.textContent = (activeSelectionId === char.id) ? "CONFIRMED OPERATOR" : `SYNCHRONIZE [ ${char.name.toUpperCase()} ]`;
            storeActionButton.classList.add('ready-select');
        } else {
            if (coinWallet >= char.price) {
                storeActionButton.textContent = `UNLOCK PROTOCOL FOR ${char.price} 🪙`;
                storeActionButton.classList.add('ready-buy');
            } else {
                storeActionButton.textContent = "INSUFFICIENT FUNDS BALLANCE";
                storeActionButton.disabled = true;
            }
        }
    }

    storeActionButton.addEventListener('click', async () => {
        if (!focusedCardId) return;
        const targetChar = AVATAR_REGISTRY.find(c => c.id === focusedCardId);
        const isUnlocked = unlockedList.includes(focusedCardId);

        if (isUnlocked) {
            const res = await fetch('/api/state/select', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_id: focusedCardId })
            });
            if (res.ok) {
                activeSelectionId = focusedCardId;
                routeToHomeCommandHub();
            }
        } else {
            const res = await fetch('/api/store/buy', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar_id: focusedCardId, price: targetChar.price })
            });
            if (res.ok) { focusedCardId = null; storeActionButton.disabled = true; synchronizeSystemDatabase(); }
        }
    });

    // --------------------------------------------------------------------------
    // SCREEN 3: HOME INTERFACE COMMAND HUB
    // --------------------------------------------------------------------------
    function routeToHomeCommandHub() {
        storeScreen.classList.add('hidden');
        modesScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');

        const activeCharacter = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        hubAvatarImg.src = activeCharacter.src;
        hubAvatarName.textContent = activeCharacter.name.toUpperCase();
    }

    document.getElementById('nav-back-to-store-btn').addEventListener('click', routeToAvatarSelectorStore);
    document.getElementById('nav-to-modes-btn').addEventListener('click', () => {
        homeScreen.classList.add('hidden');
        modesScreen.classList.remove('hidden');
    });

    // --------------------------------------------------------------------------
    // SCREEN 4: RANDOM 5 ENVIRONMENTS MODE SELECTION ARCHITECTURE
    // --------------------------------------------------------------------------
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            designatedWorldMode = card.getAttribute('data-mode');
            
            launchGameEngineBtn.disabled = false;
            launchGameEngineBtn.classList.add('ready-select');
            launchGameEngineBtn.textContent = `INITIALIZE RUN IN ${WORLD_MODES[designatedWorldMode].name.toUpperCase()}`;
        });
    });

    launchGameEngineBtn.addEventListener('click', () => {
        if (!designatedWorldMode) return;
        modesScreen.classList.add('hidden');
        telemetryBar.classList.add('hidden'); // Clear telemetry bar for clean visual immersion
        gameStage.classList.remove('hidden');
        bootGameplayCanvasLoop();
    });

    // --------------------------------------------------------------------------
    // SCREEN 5: RUNTIME CANVAS ENVIRONMENT LOOP PIPELINE
    // --------------------------------------------------------------------------
    function bootGameplayCanvasLoop() {
        ctx = canvas.getContext('2d');
        isGameRunning = true; isPaused = false;
        characterY = 350; velocityY = 0; obstacleX = 850; gameSpeed = 4.5;
        strideFrameCounter = 0;

        window.addEventListener('keydown', processPlayerJumpInput);
        renderFrameId = requestAnimationFrame(executeCoreAppGameEngineLoop);
    }

    function processPlayerJumpInput(e) {
        if (e.code === 'Space' && characterY === 350) { velocityY = -12.5; }
    }

    // Interactive Breakdown Break Pausing Action Elements
    const pauseButton = document.getElementById('pause-engine-btn');
    const resumeButton = document.getElementById('resume-engine-btn');
    const abortButton = document.getElementById('abort-to-home-btn');
    const overlayExitHomeBtn = document.getElementById('pause-exit-home-btn');

    pauseButton.addEventListener('click', () => { isPaused = true; pauseOverlay.classList.remove('hidden'); });
    resumeButton.addEventListener('click', () => { isPaused = false; pauseOverlay.classList.add('hidden'); renderFrameId = requestAnimationFrame(executeCoreAppGameEngineLoop); });
    
    function exitGameplayAndReturnHome() {
        isGameRunning = false; isPaused = false;
        cancelAnimationFrame(renderFrameId);
        window.removeEventListener('keydown', processPlayerJumpInput);
        pauseOverlay.classList.add('hidden');
        gameStage.classList.add('hidden');
        telemetryBar.classList.remove('hidden');
        synchronizeSystemDatabase();
    }
    abortButton.addEventListener('click', exitGameplayAndReturnHome);
    overlayExitHomeBtn.addEventListener('click', exitGameplayAndReturnHome);

    function executeCoreAppGameEngineLoop() {
        if (!isGameRunning || isPaused) return;

        // Fetch our environmental colors configuration variables matching your choice
        const activeTheme = WORLD_MODES[designatedWorldMode];

        // Clear view space matrix matching the custom world theme
        ctx.fillStyle = activeTheme.skyColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render floor running path line matching selected environment color parameters
        ctx.strokeStyle = activeTheme.floorColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 350); ctx.lineTo(canvas.width, 350); ctx.stroke();

        // Stride physics mapping system updates
        velocityY += 0.55; characterY += velocityY;
        if (characterY >= 350) { characterY = 350; velocityY = 0; }

        // --- RUNNING SYSTEM ANIMATION ENGINE (SQUASH AND ROTATION LAYER) ---
        strideFrameCounter++;
        let runtimeRotationAngle = 0;
        let animatedVerticalOffset = 0;

        if (characterY < 350) {
            // Jump state rotation matrix
            runtimeRotationAngle = (strideFrameCounter * 0.05) % (Math.PI * 2);
        } else {
            // Dynamic up and down bounce matching stride stride frequencies
            animatedVerticalOffset = Math.sin(strideFrameCounter * 0.25) * 4;
        }

        // Draw your ultra-premium character image directly inside the gameplay loop coordinate box!
        const activeCharacterData = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        
        ctx.save();
        ctx.translate(150, characterY - 45 + animatedVerticalOffset);
        ctx.rotate(runtimeRotationAngle);
        
        // Render image element texture frames matching dimensions cleanly
        const imageElement = new Image();
        imageElement.src = activeCharacterData.src;
        ctx.drawImage(imageElement, -30, -40, 60, 80);
        
        ctx.restore();

        // Move obstacle items across tracks safely
        obstacleX -= gameSpeed;
        if (obstacleX < -30) obstacleX = 850;

        // Draw obstacle blocks matching environment styles
        ctx.fillStyle = "#ff007f";
        ctx.fillRect(obstacleX, 325, 20, 25);

        // Collision reset router mappings
        if (obstacleX > 120 && obstacleX < 170 && characterY > 310) {
            obstacleX = 850;
            alert("COLLISION MAP WARNING: Loop Resetting safely...");
        }

        renderFrameId = requestAnimationFrame(executeCoreAppGameEngineLoop);
    }

    // Trigger boot pipeline sequence directly on execution load
    triggerBootLoaderSequence();
});
