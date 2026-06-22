/* ==========================================================================
   HEXAJUMP - 3D PERSPECTIVE ENDLESS RUNNER ENGINE (SUBWAY STYLE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // DEFINITION MATRIX: Central Operator Character Registry Mapping
    const AVATAR_REGISTRY = [
        { id: 'm1', name: 'Alpha', gender: 'male', src: 'assets/alpha.png', price: 0 },
        { id: 'm2', name: 'Striker', gender: 'male', src: 'assets/striker.png', price: 100 },
        { id: 'm3', name: 'Maverick', gender: 'male', src: 'assets/maverick.png', price: 250 },
        { id: 'f1', name: 'Nova', gender: 'female', src: 'assets/nova.png', price: 0 },
        { id: 'f2', name: 'Valkyrie', gender: 'female', src: 'assets/valkyrie.png', price: 150 },
        { id: 'f3', name: 'Athena', gender: 'female', src: 'assets/athena.png', price: 300 }
    ];

    // DEFINITION MATRIX: 5 Cinematic Environment Vectors (3D Color Profiles)
    const WORLD_MODES = {
        cyber: { name: "Cyber City Grid", sky: "#02050c", rail: "#00f0ff", dynamicGrid: true },
        jungle: { name: "Mystic Canopy", sky: "#010804", rail: "#00ff88", dynamicGrid: true },
        volcano: { name: "Magma Core Subway", sky: "#140202", rail: "#ff4500", dynamicGrid: true },
        space: { name: "Nebula Station Stage", sky: "#060114", rail: "#b500ff", dynamicGrid: true },
        grid: { name: "System Matrix Grid", sky: "#080808", rail: "#ffffff", dynamicGrid: false }
    };

    // MANAGEMENT STATE LAYER
    let accountCoins = 0; let unlockedList = [];
    let activeSelectionId = null; let focusedCardId = null;
    let designatedWorldMode = null;

    // CORE CANVAS MECHANICS
    const canvas = document.getElementById('gameCanvas');
    let ctx = null; let renderFrameId = null;
    let isGameRunning = false; let isPaused = false;

    // SUBWAY JUMP PHYSICS REGISTERS
    let playerX = 200; let playerY = 520; let velocityY = 0;
    
    // RUNNING TIMELINES
    let runningTimeline = 0; let gameSpeed = 5; let currentScore = 0;
    let obstacleQueue = [];

    // DOM INTERFACE POINTER NODES
    const loadingScreen = document.getElementById('loading-screen');
    const welcomeEnterBtn = document.getElementById('welcome-enter-btn');
    const loaderChassis = document.querySelector('.loader-chassis');
    const bootBar = document.getElementById('boot-progress');
    const telemetryBar = document.getElementById('top-nav-telemetry');
    
    const storeScreen = document.getElementById('store-screen');
    const gridContainer = document.getElementById('dynamic-avatar-grid');
    const storeActionButton = document.getElementById('store-action-btn');
    
    const homeScreen = document.getElementById('home-screen');
    const hubAvatarImg = document.getElementById('hub-avatar-img');
    const hubAvatarName = document.getElementById('hub-avatar-name');
    
    const modesScreen = document.getElementById('modes-screen');
    const modeCards = document.querySelectorAll('.sector-strip');
    const launchGameEngineBtn = document.getElementById('launch-game-engine-btn');
    
    const gameStage = document.getElementById('game-stage');
    const pauseOverlay = document.getElementById('pause-overlay');
    const liveScoreText = document.getElementById('live-score-tracker');

    // --------------------------------------------------------------------------
    // SCREEN 1: LINKED USER CLICK LOADING SEQUENCE RETRY
    // --------------------------------------------------------------------------
    welcomeEnterBtn.addEventListener('click', () => {
        welcomeEnterBtn.classList.add('hidden');
        loaderChassis.classList.remove('hidden');
        executeBootLoaderSequence();
    });

    function executeBootLoaderSequence() {
        let loadingProgress = 0;
        const loader = setInterval(() => {
            loadingProgress += Math.floor(Math.random() * 6) + 4;
            if (loadingProgress >= 100) {
                loadingProgress = 100;
                clearInterval(loader);
                loadingScreen.classList.remove('active-view');
                loadingScreen.classList.add('hidden-view');
                telemetryBar.classList.remove('hidden-view');
                telemetryBar.classList.add('active-view');
                synchronizeAccountStateData();
            }
            bootBar.style.width = `${loadingProgress}%`;
        }, 35);
    }

    // --------------------------------------------------------------------------
    // SERVER ENDPOINT API SYNCHRONIZATION
    // --------------------------------------------------------------------------
    async function synchronizeAccountStateData() {
        try {
            const response = await fetch('/api/player/data');
            const data = await response.json();
            accountCoins = data.coins;
            unlockedList = data.unlocked_avatars;
            activeSelectionId = data.selected_avatar;

            document.getElementById('coin-count').textContent = accountCoins;
            routeToHomeCommandHub();
        } catch (err) { console.error("API link anomaly: ", err); }
    }

    // --------------------------------------------------------------------------
    // SCREEN 2: OPERATORS CUSTOMIZATION MATRIX (STORE)
    // --------------------------------------------------------------------------
    function routeToAvatarSelectorStore() {
        homeScreen.classList.remove('active-view'); homeScreen.classList.add('hidden-view');
        storeScreen.classList.remove('hidden-view'); storeScreen.classList.add('active-view');
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

            const badge = document.createElement('div');
            badge.className = `price-status-badge ${isUnlocked ? 'badge-owned' : ''}`;
            badge.textContent = isUnlocked ? 'OWNED' : `${char.price} 🪙`;
            card.appendChild(badge);

            const img = document.createElement('img'); img.src = char.src;
            card.appendChild(img);

            const label = document.createElement('span');
            label.className = 'avatar-name'; label.textContent = char.name;
            card.appendChild(label);

            card.addEventListener('click', () => {
                focusedCardId = char.id;
                document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('focused-intent'));
                card.classList.add('focused-intent');
                updateStoreActionButtonContext(char, isUnlocked);
            });
            gridContainer.appendChild(card);
        });
    }

    function updateStoreActionButtonContext(char, isUnlocked) {
        storeActionButton.disabled = false; storeActionButton.className = 'action-trigger-btn';
        if (isUnlocked) {
            storeActionButton.textContent = (activeSelectionId === char.id) ? "DEPLOYED OPERATOR" : `DEPLOY [ ${char.name.toUpperCase()} ]`;
            storeActionButton.classList.add('ready-select');
        } else {
            if (accountCoins >= char.price) {
                storeActionButton.textContent = `ACQUIRE PROTOCOL FOR ${char.price} 🪙`;
                storeActionButton.classList.add('ready-buy');
            } else {
                storeActionButton.textContent = "INSUFFICIENT WALLET BALANCE"; storeActionButton.disabled = true;
            }
        }
    }

    storeActionButton.addEventListener('click', async () => {
        if (!focusedCardId) return;
        const targetOp = AVATAR_REGISTRY.find(c => c.id === focusedCardId);
        const isUnlocked = unlockedList.includes(focusedCardId);

        if (isUnlocked) {
            const res = await fetch('/api/state/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_id: focusedCardId }) });
            if (res.ok) { activeSelectionId = focusedCardId; routeToHomeCommandHub(); }
        } else {
            const res = await fetch('/api/store/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_id: focusedCardId, price: targetOp.price }) });
            if (res.ok) { focusedCardId = null; storeActionButton.disabled = true; synchronizeAccountStateData(); }
        }
    });

    // --------------------------------------------------------------------------
    // SCREEN 3: CENTRAL COMMAND INTERFACE HUB (HOME)
    // --------------------------------------------------------------------------
    function routeToHomeCommandHub() {
        storeScreen.classList.remove('active-view'); storeScreen.classList.add('hidden-view');
        modesScreen.classList.remove('active-view'); modesScreen.classList.add('hidden-view');
        homeScreen.classList.remove('hidden-view'); homeScreen.classList.add('active-view');

        const deployedOp = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        hubAvatarImg.src = deployedOp.src;
        hubAvatarName.textContent = deployedOp.name;
    }

    document.getElementById('nav-back-to-store-btn').addEventListener('click', routeToAvatarSelectorStore);
    document.getElementById('nav-to-modes-btn').addEventListener('click', () => {
        homeScreen.classList.remove('active-view'); homeScreen.classList.add('hidden-view');
        modesScreen.classList.remove('hidden-view'); modesScreen.classList.add('active-view');
    });

    // --------------------------------------------------------------------------
    // SCREEN 4: ENVIRONMENTAL GRIDS CHASSIS MATRIX CAROUSEL
    // --------------------------------------------------------------------------
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            designatedWorldMode = card.getAttribute('data-mode');
            
            launchGameEngineBtn.disabled = false; launchGameEngineBtn.className = 'action-trigger-btn ready-select';
            launchGameEngineBtn.textContent = `ENGAGE RUN IN ${WORLD_MODES[designatedWorldMode].name.toUpperCase()}`;
        });
    });

    launchGameEngineBtn.addEventListener('click', () => {
        if (!designatedWorldMode) return;
        modesScreen.classList.remove('active-view'); modesScreen.classList.add('hidden-view');
        telemetryBar.classList.remove('active-view'); telemetryBar.classList.add('hidden-view');
        gameStage.classList.remove('hidden-view'); gameStage.classList.add('active-view');
        initializeSubwayRunnerLoop();
    });

    // --------------------------------------------------------------------------
    // SCREEN 5: RUNTIME CANVAS ENDLESS 3D TRACK ENGINE
    // --------------------------------------------------------------------------
    function initializeSubwayRunnerLoop() {
        ctx = canvas.getContext('2d');
        isGameRunning = true; isPaused = false;
        playerX = 200; playerY = 520; velocityY = 0;
        runningTimeline = 0; currentScore = 0; gameSpeed = 5;
        obstacleQueue = [];

        window.addEventListener('keydown', handleSubwayControllerInputs);
        renderFrameId = requestAnimationFrame(updateSubwayRunnerLoopPipeline);
    }

    function handleSubwayControllerInputs(e) {
        if (e.code === 'Space' && playerY === 520) { velocityY = -12.5; }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') playerX = Math.max(100, playerX - 100);
        if (e.code === 'ArrowRight' || e.code === 'KeyD') playerX = Math.min(300, playerX + 100);
    }

    const pauseButton = document.getElementById('pause-engine-btn');
    const resumeButton = document.getElementById('resume-engine-btn');
    const abortButton = document.getElementById('abort-to-home-btn');
    const overlayExitHubBtn = document.getElementById('pause-exit-home-btn');

    pauseButton.addEventListener('click', () => { isPaused = true; pauseOverlay.classList.remove('hidden-view'); pauseOverlay.classList.add('active-view'); });
    resumeButton.addEventListener('click', () => { isPaused = false; pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view'); renderFrameId = requestAnimationFrame(updateSubwayRunnerLoopPipeline); });
    
    function tearDownGameplayAndReturnHome() {
        isGameRunning = false; isPaused = false;
        cancelAnimationFrame(renderFrameId);
        window.removeEventListener('keydown', handleSubwayControllerInputs);
        pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view');
        gameStage.classList.remove('active-view'); gameStage.classList.add('hidden-view');
        telemetryBar.classList.remove('hidden-view'); telemetryBar.classList.add('active-view');
        synchronizeAccountStateData();
    }
    abortButton.addEventListener('click', tearDownGameplayAndReturnHome);
    overlayExitHubBtn.addEventListener('click', tearDownGameplayAndReturnHome);

    function updateSubwayRunnerLoopPipeline() {
        if (!isGameRunning || isPaused) return;

        const activeSector = WORLD_MODES[designatedWorldMode];
        runningTimeline++; currentScore++;
        liveScoreText.textContent = `SCORE: ${String(currentScore).padStart(4, '0')}`;

        if (runningTimeline % 1000 === 0) gameSpeed += 1;

        ctx.fillStyle = activeSector.sky; ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = activeSector.rail; ctx.lineWidth = 2;
        const vanishingX = 200; const vanishingY = 220;

        [-150, -50, 50, 150].forEach(laneOffset => {
            ctx.beginPath(); ctx.moveTo(vanishingX, vanishingY);
            ctx.lineTo(vanishingX + laneOffset * 2.5, canvas.height); ctx.stroke();
        });

        if (activeSector.dynamicGrid) {
            ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                let depthProgress = ((runningTimeline * (gameSpeed * 0.4)) + (i * 70)) % 430;
                let horizontalLineY = vanishingY + depthProgress;
                if (horizontalLineY < canvas.height) {
                    ctx.beginPath(); ctx.moveTo(0, horizontalLineY); ctx.lineTo(canvas.width, horizontalLineY); ctx.stroke();
                }
            }
        }

        velocityY += 0.55; playerY += velocityY;
        if (playerY >= 520) { playerY = 520; velocityY = 0; }

        let dynamicStrideOffset = (playerY === 520) ? Math.sin(runningTimeline * 0.3) * 3 : 0;

        const deployedTexture = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        const driverImage = new Image(); driverImage.src = deployedTexture.src;

        ctx.save();
        ctx.translate(playerX, playerY - 45 + dynamicStrideOffset);
        ctx.drawImage(driverImage, -25, -45, 50, 90);
        ctx.restore();

        if (Math.random() < 0.015) {
            const laneSlots = [100, 200, 300];
            const chosenLane = laneSlots[Math.floor(Math.random() * laneSlots.length)];
            if (!obstacleQueue.some(obs => obs.targetLane === chosenLane && obs.zDepth < 80)) {
                obstacleQueue.push({ targetLane: chosenLane, zDepth: 0 });
            }
        }

        obstacleQueue.forEach((barrier, index) => {
            barrier.zDepth += (gameSpeed * 0.8);
            let scaleRatio = barrier.zDepth / 430;
            let obstacleCurrentY = vanishingY + barrier.zDepth;
            let obstacleCurrentX = vanishingX + (barrier.targetLane - vanishingX) * scaleRatio;
            let widthBounds = 28 * scaleRatio; let heightBounds = 35 * scaleRatio;

            ctx.fillStyle = "#ff007f";
            ctx.fillRect(obstacleCurrentX - widthBounds/2, obstacleCurrentY - heightBounds, widthBounds, heightBounds);
            ctx.strokeRect(obstacleCurrentX - widthBounds/2, obstacleCurrentY - heightBounds, widthBounds, heightBounds);

            if (obstacleCurrentY > 490 && obstacleCurrentY < 540) {
                if (Math.abs(playerX - obstacleCurrentX) < 25 && playerY > obstacleCurrentY - heightBounds - 15) {
                    isGameRunning = false; cancelAnimationFrame(renderFrameId);
                    alert(`CRASH SUBWAY IMPACT DETECTED! Run Log Score: ${currentScore}`);
                    tearDownGameplayAndReturnHome();
                }
            }
        });
        obstacleQueue = obstacleQueue.filter(obs => obs.zDepth < 430);

        renderFrameId = requestAnimationFrame(updateSubwayRunnerLoopPipeline);
    }
});
