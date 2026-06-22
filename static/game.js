/* ==========================================================================
   HEXAJUMP - VERTICAL SUBWAY RUNNER ARCHITECTURE WITH CHASSIS PROFILE MATRICES
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // DEFINITION MATRIX: Central Operators Character Registry Mapping
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

    // ACCOUNT STORAGE REGISTERS
    let globalUsername = ""; let globalUserID = "";
    let bestScoreRegistered = 0; let averageScoreCalculated = 0; let totalRunsLog = 0;
    let selectedProfilePicSrc = "assets/alpha.png";

    // STATE LOOP INTEGRATION VARIABLES
    let accountCoins = 0; let unlockedList = [];
    let activeSelectionId = null; let focusedCardId = null;
    let designatedWorldMode = null;

    // CORE CANVAS MECHANICS
    const canvas = document.getElementById('gameCanvas');
    let ctx = null; let renderFrameId = null;
    let isGameRunning = false; let isPaused = false;

    // 🕹️ PERSPECTIVE LANE PHYSICAL OFFSETS CONFIGURATION
    const TRACK_LANES = { left: 100, center: 200, right: 300 };
    let currentLaneTarget = "center";
    let playerX = 200; let playerY = 520; let velocityY = 0;
    
    // RUNTIME PROJECTIONS TIMELINES
    let runningTimeline = 0; let gameSpeed = 4.5; let currentScore = 0;
    let obstacleQueue = [];

    // DOM NODE DIRECTORY POINTER MAPPERS
    const loadingScreen = document.getElementById('loading-screen');
    const welcomeEnterBtn = document.getElementById('welcome-enter-btn');
    const loaderChassis = document.querySelector('.loader-chassis');
    const bootBar = document.getElementById('boot-progress');
    const telemetryBar = document.getElementById('top-nav-telemetry');
    const navUsernameText = document.getElementById('nav-display-username');
    
    // Account Creation Nodes
    const accountCreationScreen = document.getElementById('account-creation-screen');
    const usernameInputField = document.getElementById('username-input');
    const profilePicRow = document.getElementById('profile-pic-selection-row');
    const confirmAccountBtn = document.getElementById('confirm-account-btn');

    // Operator Shop View Elements
    const storeScreen = document.getElementById('store-screen');
    const gridContainer = document.getElementById('dynamic-avatar-grid');
    const storeActionButton = document.getElementById('store-action-btn');
    const storeToHubBtn = document.getElementById('store-to-hub-btn');

    // Home Command View Elements
    const homeScreen = document.getElementById('home-screen');
    const hubAvatarImg = document.getElementById('hub-avatar-img');
    const hubAvatarName = document.getElementById('hub-avatar-name');
    const triggerProfileModalBtn = document.getElementById('trigger-user-overlay-btn');

    // World Modes Selection Elements
    const modesScreen = document.getElementById('modes-screen');
    const modeCards = document.querySelectorAll('.sector-strip');
    const launchGameEngineBtn = document.getElementById('launch-game-engine-btn');
    const modesToHubBtn = document.getElementById('modes-to-hub-btn');

    // Gameplay Stage Panels
    const gameStage = document.getElementById('game-stage');
    const pauseOverlay = document.getElementById('pause-overlay');
    const liveScoreText = document.getElementById('live-score-tracker');

    // User Profile Overlay Stats Sheet Elements
    const userProfileModal = document.getElementById('user-profile-modal');
    const closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
    const statsImg = document.getElementById('profile-stats-img');
    const statsUser = document.getElementById('profile-stats-username');
    const statsUid = document.getElementById('profile-stats-uid');
    const statsBest = document.getElementById('stat-best-score');
    const statsAvg = document.getElementById('stat-avg-score');
    const statsCount = document.getElementById('stat-total-runs');

    // --------------------------------------------------------------------------
    // SCREEN 1 & INTRO MODULE: BOOT SECTORS & FORM VALIDATION ARCHITECTURE
    // --------------------------------------------------------------------------
    welcomeEnterBtn.addEventListener('click', () => {
        welcomeEnterBtn.classList.add('hidden'); loaderChassis.classList.remove('hidden');
        executeBootLoaderSequence();
    });

    function executeBootLoaderSequence() {
        let loadingProgress = 0;
        const loader = setInterval(() => {
            loadingProgress += Math.floor(Math.random() * 6) + 4;
            if (loadingProgress >= 100) {
                loadingProgress = 100; clearInterval(loader);
                loadingScreen.classList.remove('active-view'); loadingScreen.classList.add('hidden-view');
                mountAccountRegistrationView(); // Step Forward to account data sheet initialization!
            }
            bootBar.style.width = `${loadingProgress}%`;
        }, 35);
    }

    function mountAccountRegistrationView() {
        accountCreationScreen.classList.remove('hidden-view'); accountCreationScreen.classList.add('active-view');
        profilePicRow.innerHTML = '';
        
        // Loop through register to present character choices as account avatars
        AVATAR_REGISTRY.slice(0, 3).forEach((char, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = `pic-node-option ${index === 0 ? 'active-option' : ''}`;
            const img = document.createElement('img'); img.src = char.src;
            wrapper.appendChild(img);

            wrapper.addEventListener('click', () => {
                document.querySelectorAll('.pic-node-option').forEach(n => n.classList.remove('active-option'));
                wrapper.classList.add('active-option');
                selectedProfilePicSrc = char.src;
            });
            profilePicRow.appendChild(wrapper);
        });

        usernameInputField.addEventListener('input', () => {
            const val = usernameInputField.value.trim();
            if (val.length >= 3) {
                confirmAccountBtn.disabled = false; confirmAccountBtn.classList.add('ready-select');
            } else {
                confirmAccountBtn.disabled = true; confirmAccountBtn.classList.remove('ready-select');
            }
        });
    }

    confirmAccountBtn.addEventListener('click', () => {
        globalUsername = usernameInputField.value.trim();
        globalUserID = "ID_" + Math.floor(100000 + Math.random() * 900000); // Generate hash
        navUsernameText.textContent = globalUsername.toUpperCase();

        accountCreationScreen.classList.remove('active-view'); accountCreationScreen.classList.add('hidden-view');
        telemetryBar.classList.remove('hidden-view'); telemetryBar.classList.add('active-view');
        synchronizeAccountStateData();
    });

    // --------------------------------------------------------------------------
    // FULL SERVER ENDPOINT CONNECTION LAYER
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
        } catch (err) { console.error("API mapping failure: ", err); }
    }

    // --------------------------------------------------------------------------
    // ACCOUNT SYSTEM USER MODAL PANEL STATE HANDLERS
    // --------------------------------------------------------------------------
    triggerProfileModalBtn.addEventListener('click', () => {
        statsImg.src = selectedProfilePicSrc;
        statsUser.textContent = globalUsername;
        statsUid.textContent = globalUserID;
        statsBest.textContent = String(bestScoreRegistered).padStart(4, '0');
        statsAvg.textContent = String(Math.floor(averageScoreCalculated)).padStart(4, '0');
        statsCount.textContent = totalRunsLog;

        userProfileModal.classList.remove('hidden-view'); userProfileModal.classList.add('active-view');
    });
    closeProfileModalBtn.addEventListener('click', () => { userProfileModal.classList.remove('active-view'); userProfileModal.classList.add('hidden-view'); });

    // --------------------------------------------------------------------------
    // SCREEN 2: EQUIPMENT MATRIX STORE LOGIC
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
    // SCREEN 3: HOME INTERFACE OPERATIONS CONTROL HUB
    // --------------------------------------------------------------------------
    function routeToHomeCommandHub() {
        storeScreen.classList.remove('active-view'); storeScreen.classList.add('hidden-view');
        modesScreen.classList.remove('active-view'); modesScreen.classList.add('hidden-view');
        homeScreen.classList.remove('hidden-view'); homeScreen.classList.add('active-view');

        const deployedOp = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        hubAvatarImg.src = deployedOp.src;
        hubAvatarName.textContent = deployedOp.name;
    }

    document.getElementById('nav-to-store-btn').addEventListener('click', routeToAvatarSelectorStore);
    storeToHubBtn.addEventListener('click', routeToHomeCommandHub);
    modesToHubBtn.addEventListener('click', routeToHomeCommandHub);

    document.getElementById('nav-to-modes-btn').addEventListener('click', () => {
        homeScreen.classList.remove('active-view'); homeScreen.classList.add('hidden-view');
        modesScreen.classList.remove('hidden-view'); modesScreen.classList.add('active-view');
    });

    // --------------------------------------------------------------------------
    // SCREEN 4: ENVIRONMENTAL WORLD MAPS CAROUSEL
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
    // SCREEN 5: RUNTIME CANVAS ENDLESS 3-LANE PERSPECTIVE PIPELINE ENGINE
    // --------------------------------------------------------------------------
    function initializeSubwayRunnerLoop() {
        ctx = canvas.getContext('2d');
        isGameRunning = true; isPaused = false;
        currentLaneTarget = "center"; playerX = TRACK_LANES[currentLaneTarget];
        playerY = 520; velocityY = 0;
        runningTimeline = 0; currentScore = 0; gameSpeed = 5;
        obstacleQueue = [];

        window.addEventListener('keydown', handleSubwayControllerInputs);
        renderFrameId = requestAnimationFrame(updateSubwayRunnerLoopPipeline);
    }

    function handleSubwayControllerInputs(e) {
        if (!isGameRunning || isPaused) return;
        if (e.code === 'Space' && playerY === 520) { velocityY = -12.5; }
        
        // Accurate Complete 3-Lane Traversal Locking System (Left, Center, Right)
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            if (currentLaneTarget === "center") currentLaneTarget = "left";
            else if (currentLaneTarget === "right") currentLaneTarget = "center";
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            if (currentLaneTarget === "center") currentLaneTarget = "right";
            else if (currentLaneTarget === "left") currentLaneTarget = "center";
        }
    }

    // Modal Suspension Action Listeners Configuration Row
    const pauseButton = document.getElementById('pause-engine-btn');
    const resumeButton = document.getElementById('resume-engine-btn');
    const abortButton = document.getElementById('abort-to-home-btn');
    const overlayLogoutGameBtn = document.getElementById('pause-exit-home-btn');

    pauseButton.addEventListener('click', () => { isPaused = true; pauseOverlay.classList.remove('hidden-view'); pauseOverlay.classList.add('active-view'); });
    resumeButton.addEventListener('click', () => { isPaused = false; pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view'); renderFrameId = requestAnimationFrame(updateSubwayRunnerLoopPipeline); });
    
    function exitLoopAndReturnToHub() {
        isGameRunning = false; isPaused = false;
        cancelAnimationFrame(renderFrameId);
        window.removeEventListener('keydown', handleSubwayControllerInputs);
        pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view');
        gameStage.classList.remove('active-view'); gameStage.classList.add('hidden-view');
        telemetryBar.classList.remove('hidden-view'); telemetryBar.classList.add('active-view');
        
        // Record and aggregate account score data sets directly on local cache bounds
        totalRunsLog++;
        if(currentScore > bestScoreRegistered) { bestScoreRegistered = currentScore; }
        averageScoreCalculated = ((averageScoreCalculated * (totalRunsLog - 1)) + currentScore) / totalRunsLog;

        synchronizeAccountStateData();
    }
    abortButton.addEventListener('click', exitLoopAndReturnToHub);

    // LOGOUT GAME Pathway Router Link Configuration
    overlayLogoutGameBtn.addEventListener('click', () => {
        isGameRunning = false; isPaused = false;
        cancelAnimationFrame(renderFrameId);
        window.removeEventListener('keydown', handleSubwayControllerInputs);
        
        // Accumulate statistics bounds before returning to core loader
        totalRunsLog++;
        if(currentScore > bestScoreRegistered) { bestScoreRegistered = currentScore; }
        averageScoreCalculated = ((averageScoreCalculated * (totalRunsLog - 1)) + currentScore) / totalRunsLog;

        pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view');
        gameStage.classList.remove('active-view'); gameStage.classList.add('hidden-view');
        
        // Reset full layout routing and bounce back to first landing welcome page
        loadingScreen.classList.remove('hidden-view'); loadingScreen.classList.add('active-view');
        welcomeEnterBtn.classList.remove('hidden'); loaderChassis.classList.add('hidden');
    });

    function updateSubwayRunnerLoopPipeline() {
        if (!isGameRunning || isPaused) return;

        const activeSector = WORLD_MODES[designatedWorldMode];
        runningTimeline++; currentScore++;
        liveScoreText.textContent = `SCORE: ${String(currentScore).padStart(4, '0')}`;

        if (runningTimeline % 1000 === 0) gameSpeed += 0.8;

        // Draw 3D Sky Dome Panels
        ctx.fillStyle = activeSector.sky; ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render rolling perspective horizon lines receding down into the center point vanishing horizon
        ctx.strokeStyle = activeSector.rail; ctx.lineWidth = 2.5;
        const vanishingX = 200; const vanishingY = 220;

        // Four track guide walls convergence line points drawing
        [-150, -50, 50, 150].forEach(laneOffset => {
            ctx.beginPath(); ctx.moveTo(vanishingX, vanishingY);
            ctx.lineTo(vanishingX + laneOffset * 2.5, canvas.height); ctx.stroke();
        });

        if (activeSector.dynamicGrid) {
            ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                let depthProgress = ((runningTimeline * (gameSpeed * 0.4)) + (i * 70)) % 430;
                let horizontalLineY = vanishingY + depthProgress;
                if (horizontalLineY < canvas.height) {
                    ctx.beginPath(); ctx.moveTo(0, horizontalLineY); ctx.lineTo(canvas.width, horizontalLineY); ctx.stroke();
                }
            }
        }

        // Smoothly interpolate the playerX coordinate toward the targeted lane to create fluid horizontal sliding animations
        const targetXCoordinate = TRACK_LANES[currentLaneTarget];
        playerX += (targetXCoordinate - playerX) * 0.25;

        velocityY += 0.55; playerY += velocityY;
        if (playerY >= 520) { playerY = 520; velocityY = 0; }

        let dynamicStrideOffset = (playerY === 520) ? Math.sin(runningTimeline * 0.3) * 4 : 0;

        const deployedTexture = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        const driverImage = new Image(); driverImage.src = deployedTexture.src;

        ctx.save();
        ctx.translate(playerX, playerY - 45 + dynamicStrideOffset);
        ctx.drawImage(driverImage, -25, -45, 50, 90);
        ctx.restore();

        // 🪨 PERSPECTIVE GENERATION FOR 3D GEOMETRIC STONE FORMATIONS 
        if (Math.random() < 0.016) {
            const laneSlots = [100, 200, 300];
            const chosenLane = laneSlots[Math.floor(Math.random() * laneSlots.length)];
            if (!obstacleQueue.some(obs => obs.targetLane === chosenLane && obs.zDepth < 90)) {
                obstacleQueue.push({ targetLane: chosenLane, zDepth: 0 });
            }
        }

        obstacleQueue.forEach((stone, index) => {
            stone.zDepth += (gameSpeed * 0.75);

            let scaleRatio = stone.zDepth / 430;
            let obstacleCurrentY = vanishingY + stone.zDepth;
            let obstacleCurrentX = vanishingX + (stone.targetLane - vanishingX) * scaleRatio;
            
            // Scaled dimensional projection vectors matching perspective depths
            let stoneWidth = 36 * scaleRatio; let stoneHeight = 24 * scaleRatio;

            // DRAWING PROCEDURAL GEOMETRIC 3D SHADED STONES (🪨)
            ctx.save();
            ctx.translate(obstacleCurrentX, obstacleCurrentY);
            
            // Build rock linear gradient shading properties
            let stoneGrad = ctx.createLinearGradient(-stoneWidth/2, -stoneHeight, stoneWidth/2, 0);
            stoneGrad.addColorStop(0, '#7f8c8d'); stoneGrad.addColorStop(1, '#34495e');
            ctx.fillStyle = stoneGrad; ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(-stoneWidth/2, 0);
            ctx.lineTo(-stoneWidth * 0.4, -stoneHeight * 0.8);
            ctx.lineTo(0, -stoneHeight);
            ctx.lineTo(stoneWidth * 0.4, -stoneHeight * 0.7);
            ctx.lineTo(stoneWidth/2, 0);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            
            ctx.restore();

            // Subway 3D Collision Hitbox Framework
            if (obstacleCurrentY > 490 && obstacleCurrentY < 540) {
                if (Math.abs(playerX - obstacleCurrentX) < 30 && playerY > obstacleCurrentY - stoneHeight - 15) {
                    isGameRunning = false; cancelAnimationFrame(renderFrameId);
                    
                    const currentOpName = AVATAR_REGISTRY.find(o => o.id === activeSelectionId).name;
                    alert(`🚨 CRASH IMPACT DETECTED! 🚨\n\nOperator: ${currentOpName.toUpperCase()}\nSector Run Score: ${currentScore}`);
                    
                    // Route directly through exit handler to accumulate statistics logs cleanly
                    exitLoopAndReturnToHub();
                }
            }
        });
        obstacleQueue = obstacleQueue.filter(obs => obs.zDepth < 430);

        renderFrameId = requestAnimationFrame(updateSubwayRunnerLoopPipeline);
    }

    // Execute core app loader loop sequence immediately
    executeBootLoaderSequence();
});
