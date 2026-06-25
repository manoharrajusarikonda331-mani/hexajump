/* ==========================================================================
   HEXAJUMP - ENDLESS SUBWAY RUNNER ARCHITECTURE WITH INTEGRATED STATS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // DEFINITION MATRIX: Central Character Data Profiles (3 Male, 3 Female 2D Code Vectors)
    const AVATAR_REGISTRY = [
        { id: 'm1', name: 'Alpha', gender: 'male', headSkin: '#ffcc99', clothing: '#00a8ff', pants: '#333333', price: 0, portrait3d: 'static/assets/alpha.png' },
        { id: 'm2', name: 'Striker', gender: 'male', headSkin: '#e0ac69', clothing: '#ffb700', pants: '#111111', price: 100, portrait3d: 'static/assets/striker.png' },
        { id: 'm3', name: 'Maverick', gender: 'male', headSkin: '#ffdbac', clothing: '#00ff88', pants: '#222222', price: 250, portrait3d: 'static/assets/maverick.png' },
        { id: 'f1', name: 'Nova', gender: 'female', headSkin: '#ffcccc', clothing: '#ff007f', pants: '#444444', price: 0, portrait3d: 'static/assets/nova.png' },
        { id: 'f2', name: 'Valkyrie', gender: 'female', headSkin: '#f1c27d', clothing: '#b500ff', pants: '#1e1e1e', price: 150, portrait3d: 'static/assets/valkyrie.png' },
        { id: 'f3', name: 'Athena', gender: 'female', headSkin: '#ffd1dc', clothing: '#00f0ff', pants: '#2c3e50', price: 300, portrait3d: 'static/assets/athena.png' }
    ];

    // DEFINITION MATRIX: 5 Real-Time Styled Road Paths Viewport Environments
    const WORLD_MODES = {
        railway: { name: "Railway Track Path 🛤️", sky: "#040914", laneLines: "#ff007f", tiesColor: "#2c3e50" },
        desert: { name: "Desert Road Path 🏜️", sky: "#1a0f02", laneLines: "#ffb700", tiesColor: "#d35400" },
        city: { name: "City Road Path 🛣️", sky: "#08080f", laneLines: "#ffffff", tiesColor: "#34495e" },
        bridge: { name: "Bridge Road Path 🌉", sky: "#03141a", laneLines: "#00f0ff", tiesColor: "#16a085" },
        mountain: { name: "Mountain Road Path 🏞️", sky: "#021206", laneLines: "#00ff88", tiesColor: "#27ae60" }
    };

    // SYSTEM USER ACCOUNT TELEMETRY REGISTER CACHE
    let globalUsername = ""; let globalUserID = "";
    let highBestScore = 0; let computedAvgScore = 0; let totalRunsCount = 0;
    let selected3DPortraitFile = "static/assets/alpha.png";

    // STATE CONTROL VARIABLES
    let coinWallet = 0; let unlockedList = [];
    let activeSelectionId = 'm1'; let focusedCardId = null;
    let designatedWorldMode = null;

    // RUNTIME ENVIRONMENT ENGINE PROPERTIES
    const canvas = document.getElementById('gameCanvas');
    let ctx = null; let renderFrameId = null;
    let isGameRunning = false; let isPaused = false;

    // PHYSICAL LANE OFFSETS SWITCHING CONFIGS
    const TRACK_LANES = { left: 100, center: 200, right: 300 };
    let activeLaneKey = "center";
    let playerX = 200; let playerY = 520; let velocityY = 0;
    
    // Gradual progression parameters for friendly gameplay loop mechanics
    let runningTimeline = 0; 
    let gameSpeed = 2.2;        
    let speedIncrement = 0.0005; 
    let sessionScore = 0; let sessionCoinsEarned = 0;
    let obstacleQueue = [];
   
    // DOM NODE CAPTURES DIRECTORY
    const loadingScreen = document.getElementById('loading-screen');
    const bootBar = document.getElementById('boot-progress');
    const telemetryBar = document.getElementById('top-nav-telemetry');
    const navUsernameText = document.getElementById('nav-display-username');
    const navPfpIconImg = document.getElementById('nav-pfp-icon-img');
    const profileTriggerBtn = document.getElementById('nav-profile-trigger');
    
    const accountCreationScreen = document.getElementById('account-creation-screen');
    const usernameInputField = document.getElementById('username-input');
    const confirmAccountBtn = document.getElementById('confirm-account-btn');

    const storeScreen = document.getElementById('store-screen');
    const gridContainer = document.getElementById('dynamic-avatar-grid');
    const storeActionButton = document.getElementById('store-action-btn');
    const storeToHubBtn = document.getElementById('store-to-hub-btn');

    const homeScreen = document.getElementById('home-screen');
    const hubAvatarName = document.getElementById('hub-avatar-name');
    const hubCharacterCanvas = document.getElementById('hubCharacterCanvas');
    const hCtx = hubCharacterCanvas ? hubCharacterCanvas.getContext('2d') : null;

    const modesScreen = document.getElementById('modes-screen');
    const modeCards = document.querySelectorAll('.sector-strip');
    const launchGameEngineBtn = document.getElementById('launch-game-engine-btn');
    const modesToHubBtn = document.getElementById('modes-to-hub-btn');

    const gameStage = document.getElementById('game-stage');
    const pauseOverlay = document.getElementById('pause-overlay');
    const liveScoreText = document.getElementById('live-score-tracker');
    const liveCoinsText = document.getElementById('live-coins-count');
    const gameOverOverlay = document.getElementById('game-over-overlay');

    const userProfileModal = document.getElementById('user-profile-modal');
    const closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
    const statsImg = document.getElementById('profile-stats-img');
    const statsUserEditor = document.getElementById('profile-username-editor');
    const editUsernameToggleBtn = document.getElementById('edit-username-toggle-btn');
    const statsUid = document.getElementById('profile-stats-uid');
    const statsBest = document.getElementById('stat-best-score');
    const statsAvg = document.getElementById('stat-avg-score');
    const statsCount = document.getElementById('stat-total-runs');
    const editPfpTriggerBtn = document.getElementById('edit-pfp-trigger-btn');
    const pfpDropdownDrawerGrid = document.getElementById('pfp-images-dropdown-subgrid');
    const pfpPortraitImagesRow = document.getElementById('pfp-portrait-images-row');

    // SCREEN 1: DYNAMIC LOADING PIPELINE (HARD-LOCKED TO 7 SECONDS)
    function fireInitialBootLoaderPipeline() {
        const totalDuration = 7000; 
        const tickInterval = 50;    
        let timeElapsed = 0;

        const loader = setInterval(() => {
            timeElapsed += tickInterval;
            let loadingProgress = (timeElapsed / totalDuration) * 100;

            if (loadingProgress >= 100) {
                loadingProgress = 100;
                clearInterval(loader);
                if (loadingScreen) {
                    loadingScreen.classList.remove('active-view'); 
                    loadingScreen.classList.add('hidden-view');
                }
                mountAccountRegistrationFormView();
            }
            if (bootBar) bootBar.style.width = `${loadingProgress}%`;
        }, tickInterval);
    }

    function mountAccountRegistrationFormView() {
        if (accountCreationScreen) {
            accountCreationScreen.classList.remove('hidden-view'); 
            accountCreationScreen.classList.add('active-view');
        }
        if (usernameInputField) {
            usernameInputField.addEventListener('input', () => {
                if (usernameInputField.value.trim().length >= 3) {
                    confirmAccountBtn.disabled = false; confirmAccountBtn.classList.add('ready-select');
                } else {
                    confirmAccountBtn.disabled = true; confirmAccountBtn.classList.remove('ready-select');
                }
            });
        }
    }

    if (confirmAccountBtn) {
        confirmAccountBtn.addEventListener('click', () => {
            globalUsername = usernameInputField.value.trim();
            globalUserID = "ID_" + Math.floor(100000 + Math.random() * 900000);
            if (navUsernameText) navUsernameText.textContent = globalUsername.toUpperCase();

            if (accountCreationScreen) {
                accountCreationScreen.classList.remove('active-view'); 
                accountCreationScreen.classList.add('hidden-view');
            }
            if (telemetryBar) {
                telemetryBar.classList.remove('hidden-view'); 
                telemetryBar.classList.add('active-view');
            }
            synchronizeServerDatabaseState();
        });
    }

    // SERVER OR STANDALONE LOCAL FALLBACK MANAGEMENT
    async function synchronizeServerDatabaseState() {
        try {
            const response = await fetch('/api/player/data');
            if (response.ok) {
                const data = await response.json();
                coinWallet = data.coins || 1000;
                unlockedList = data.unlocked_avatars || ['m1', 'f1'];
                activeSelectionId = data.selected_avatar || 'm1';
            } else {
                coinWallet = 1000; unlockedList = ['m1', 'f1']; activeSelectionId = 'm1';
            }
        } catch (err) { 
            console.warn("Server connection idling. Accessing secure offline profiles wrapper matrix: ", err); 
            coinWallet = 1000; unlockedList = ['m1', 'f1']; activeSelectionId = 'm1';
        } finally {
            const coinCountEl = document.getElementById('coin-count');
            if (coinCountEl) coinCountEl.textContent = coinWallet;
            
            const selectedChar = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
            if (selectedChar) selected3DPortraitFile = selectedChar.portrait3d;
            if (navPfpIconImg) navPfpIconImg.src = selected3DPortraitFile;
            
            routeToHomeCommandHub();
        }
    }

    // USER PROFILE MODAL BINDINGS
    if (profileTriggerBtn) {
        profileTriggerBtn.addEventListener('click', () => {
            if (statsImg) statsImg.src = selected3DPortraitFile;
            if (statsUserEditor) statsUserEditor.value = globalUsername;
            if (statsUid) statsUid.textContent = globalUserID;
            if (statsBest) statsBest.textContent = String(highBestScore).padStart(4, '0');
            if (statsAvg) statsAvg.textContent = String(Math.floor(computedAvgScore)).padStart(4, '0');
            if (statsCount) statsCount.textContent = totalRunsCount;

            if (pfpDropdownDrawerGrid) pfpDropdownDrawerGrid.classList.add('hidden'); 
            if (userProfileModal) {
                userProfileModal.classList.remove('hidden-view'); 
                userProfileModal.classList.add('active-view');
            }
        });
    }
    
    if (closeProfileModalBtn) {
        closeProfileModalBtn.addEventListener('click', () => { 
            if (userProfileModal) {
                userProfileModal.classList.remove('active-view'); 
                userProfileModal.classList.add('hidden-view'); 
            }
        });
    }

    if (editPfpTriggerBtn) {
        editPfpTriggerBtn.addEventListener('click', () => {
            if (pfpDropdownDrawerGrid && !pfpDropdownDrawerGrid.classList.contains('hidden')) {
                pfpDropdownDrawerGrid.classList.add('hidden'); 
                return;
            }
            if (pfpPortraitImagesRow) pfpPortraitImagesRow.innerHTML = '';
            
            AVATAR_REGISTRY.forEach(char => {
                const wrap = document.createElement('div');
                wrap.className = `drawer-pfp-node ${selected3DPortraitFile === char.portrait3d ? 'active-pfp' : ''}`;
                
                const img = document.createElement('img'); 
                img.src = char.portrait3d;
                wrap.appendChild(img);

                wrap.addEventListener('click', () => {
                    selected3DPortraitFile = char.portrait3d;
                    if (statsImg) statsImg.src = selected3DPortraitFile;
                    if (navPfpIconImg) navPfpIconImg.src = selected3DPortraitFile;
                    document.querySelectorAll('.drawer-pfp-node').forEach(n => n.classList.remove('active-pfp'));
                    wrap.classList.add('active-pfp');
                });
                if (pfpPortraitImagesRow) pfpPortraitImagesRow.appendChild(wrap);
            });
            if (pfpDropdownDrawerGrid) pfpDropdownDrawerGrid.classList.remove('hidden');
        });
    }

    if (editUsernameToggleBtn) {
        editUsernameToggleBtn.addEventListener('click', () => {
            if (statsUserEditor) {
                if (statsUserEditor.disabled) {
                    statsUserEditor.disabled = false; statsUserEditor.focus(); editUsernameToggleBtn.textContent = "💾";
                } else {
                    const newName = statsUserEditor.value.trim();
                    if (newName.length >= 3) {
                        globalUsername = newName; if (navUsernameText) navUsernameText.textContent = globalUsername.toUpperCase();
                    }
                    statsUserEditor.disabled = true; editUsernameToggleBtn.textContent = "✏️";
                }
            }
        });
    }
   
    // SHOP VIEW LAYOUT SYSTEMS
    function routeToAvatarSelectorStore() {
        if (homeScreen) { homeScreen.classList.remove('active-view'); homeScreen.classList.add('hidden-view'); }
        if (storeScreen) { storeScreen.classList.remove('hidden-view'); storeScreen.classList.add('active-view'); }
        renderStoreGridPanel();
    }

    function renderStoreGridPanel() {
        if (!gridContainer) return;
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

            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 70; previewCanvas.height = 90;
            const pCtx = previewCanvas.getContext('2d');
            draw2DMiniHumanVector(pCtx, 35, 75, char.id, 0, false);
            card.appendChild(previewCanvas);

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
        if (!storeActionButton) return;
        storeActionButton.disabled = false; storeActionButton.className = 'action-trigger-btn';
        if (isUnlocked) {
            storeActionButton.textContent = (activeSelectionId === char.id) ? "ACTIVE OPERATOR" : `DEPLOY [ ${char.name.toUpperCase()} ]`;
            storeActionButton.classList.add('ready-select');
        } else {
            if (coinWallet >= char.price) {
                storeActionButton.textContent = `UNLOCK FOR ${char.price} 🪙`;
                storeActionButton.classList.add('ready-buy');
            } else {
                storeActionButton.textContent = "INSUFFICIENT COINS BALANCE"; storeActionButton.disabled = true;
            }
        }
    }

    if (storeActionButton) {
        storeActionButton.addEventListener('click', async () => {
            if (!focusedCardId) return;
            const targetOp = AVATAR_REGISTRY.find(c => c.id === focusedCardId);
            const isUnlocked = unlockedList.includes(focusedCardId);

            if (isUnlocked) {
                const res = await fetch('/api/state/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_id: focusedCardId }) });
                if (res.ok) { activeSelectionId = focusedCardId; routeToHomeCommandHub(); }
            } else {
                const res = await fetch('/api/store/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar_id: focusedCardId, price: targetOp.price }) });
                if (res.ok) { focusedCardId = null; storeActionButton.disabled = true; synchronizeServerDatabaseState(); }
            }
        });
    }

    // HOME PANEL ENGINE TERMINAL
    function routeToHomeCommandHub() {
        if (storeScreen) { storeScreen.classList.remove('active-view'); storeScreen.classList.add('hidden-view'); }
        if (modesScreen) { modesScreen.classList.remove('active-view'); modesScreen.classList.add('hidden-view'); }
        if (homeScreen) { homeScreen.classList.remove('hidden-view'); homeScreen.classList.add('active-view'); }

        const activeCharacter = AVATAR_REGISTRY.find(c => c.id === activeSelectionId);
        if (hubAvatarName && activeCharacter) hubAvatarName.textContent = activeCharacter.name;
        
        if (hCtx && hubCharacterCanvas) {
            hCtx.clearRect(0, 0, hubCharacterCanvas.width, hubCharacterCanvas.height);
            draw2DMiniHumanVector(hCtx, 80, 160, activeSelectionId, 0, true);
        }
    }

    const navToStoreBtn = document.getElementById('nav-to-store-btn');
    if (navToStoreBtn) navToStoreBtn.addEventListener('click', routeToAvatarSelectorStore);
    if (storeToHubBtn) storeToHubBtn.addEventListener('click', routeToHomeCommandHub);
    if (modesToHubBtn) modesToHubBtn.addEventListener('click', routeToHomeCommandHub);

    const navToModesBtn = document.getElementById('nav-to-modes-btn');
    if (navToModesBtn) {
        navToModesBtn.addEventListener('click', () => {
            if (homeScreen) { homeScreen.classList.remove('active-view'); homeScreen.classList.add('hidden-view'); }
            if (modesScreen) { modesScreen.classList.remove('hidden-view'); modesScreen.classList.add('active-view'); }
        });
    }

    // ROAD MODES TUNNEL CAROUSEL
    modeCards.forEach(card => {
        card.addEventListener('click', () => {
            modeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            designatedWorldMode = card.getAttribute('data-mode');
            
            if (launchGameEngineBtn) {
                launchGameEngineBtn.disabled = false; launchGameEngineBtn.className = 'action-trigger-btn ready-select';
                launchGameEngineBtn.textContent = `ENGAGE SYSTEM RUNLINK`;
            }
        });
    });

    if (launchGameEngineBtn) {
        launchGameEngineBtn.addEventListener('click', () => {
            if (!designatedWorldMode) return;
            if (modesScreen) { modesScreen.classList.remove('active-view'); modesScreen.classList.add('hidden-view'); }
            if (telemetryBar) { telemetryBar.classList.remove('active-view'); telemetryBar.classList.add('hidden-view'); }
            if (gameStage) { gameStage.classList.remove('hidden-view'); gameStage.classList.add('active-view'); }
            initializeEndlessSubwayEngineLoop();
        });
    }

    // 2D CANVAS GRAPHICS PROCEDURAL RENDER SYSTEM
    function draw2DMiniHumanVector(context, x, y, characterId, timelineFrames = 0, animateIdle = false) {
        if (!context) return;
        const data = AVATAR_REGISTRY.find(c => c.id === characterId);
        if (!data) return; 
        context.save();
        context.translate(x, y);

        let bodyBounce = (animateIdle) ? Math.sin(Date.now() * 0.004) * 2 : 0;
        let runningCycle = Math.sin(timelineFrames * 0.25);

        context.strokeStyle = '#000000'; context.lineWidth = 2.5;

        // Legs
        context.fillStyle = data.pants;
        if (timelineFrames > 0) {
            context.fillRect(-12, 0 + (runningCycle > 0 ? -5 : 0), 6, 12);
            context.fillRect(6, 0 + (runningCycle < 0 ? -5 : 0), 6, 12);
        } else {
            context.fillRect(-10, 0, 6, 12); context.fillRect(4, 0, 6, 12);
        }

        // Torso
        context.fillStyle = data.clothing;
        context.fillRect(-14, -34 + bodyBounce, 28, 34);
        context.strokeRect(-14, -34 + bodyBounce, 28, 34);

        // Hands
        context.fillStyle = data.headSkin;
        if (timelineFrames > 0) {
            context.fillRect(-19, -28 + bodyBounce + (runningCycle * 4), 5, 12);
            context.fillRect(14, -28 + bodyBounce - (runningCycle * 4), 5, 12);
        } else {
            context.fillRect(-18, -26 + bodyBounce, 4, 12);
            context.fillRect(14, -26 + bodyBounce, 4, 12);
        }

        // Skull Cap Arc
        context.fillStyle = data.headSkin;
        context.beginPath(); context.arc(0, -47 + bodyBounce, 11, 0, Math.PI * 2); context.fill(); context.stroke();

        // Facials
        context.fillStyle = "#ffffff"; context.fillRect(-5, -50 + bodyBounce, 3, 3); context.fillRect(2, -50 + bodyBounce, 3, 3);
        context.fillStyle = "#000000"; context.fillRect(-4, -49 + bodyBounce, 1.5, 1.5); context.fillRect(3, -49 + bodyBounce, 1.5, 1.5);
        context.fillStyle = "#ff4d4d"; context.fillRect(-2, -41 + bodyBounce, 4, 1.5);

        // Hair Layer
        context.fillStyle = "#2c1a04"; 
        if (data.gender === 'female') {
            context.fillRect(-13, -59 + bodyBounce, 26, 11);
            context.fillRect(-13, -48 + bodyBounce, 4, 22);
            context.fillRect(9, -48 + bodyBounce, 4, 22);
        } else {
            context.fillRect(-12, -58 + bodyBounce, 24, 10);
        }

        context.restore();
    }

    // GAMEPLAY LOOPS RUNTIME PIPELINE
    function initializeEndlessSubwayEngineLoop() {
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        isGameRunning = true; isPaused = false;
        activeLaneKey = "center"; playerX = TRACK_LANES[activeLaneKey];
        playerY = 520; velocityY = 0;
        runningTimeline = 0; sessionScore = 0; sessionCoinsEarned = 0; gameSpeed = 4.8;
        obstacleQueue = [];

        window.addEventListener('keydown', handleEndlessTrackControllerInputs);
        renderFrameId = requestAnimationFrame(updateEndlessTrackLoopPipelineFrame);
    }

    function handleEndlessTrackControllerInputs(e) {
        if (!isGameRunning || isPaused) return;
        if (e.code === 'Space' && playerY === 520) { velocityY = -12; }
        
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            if (activeLaneKey === "center") activeLaneKey = "left";
            else if (activeLaneKey === "right") activeLaneKey = "center";
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            if (activeLaneKey === "center") activeLaneKey = "right";
            else if (activeLaneKey === "left") activeLaneKey = "center";
        }
    }

    const pauseButton = document.getElementById('pause-engine-btn');
    const resumeButton = document.getElementById('resume-core-run-btn');

    if (pauseButton) {
        pauseButton.addEventListener('click', () => { isPaused = true; if (pauseOverlay) { pauseOverlay.classList.remove('hidden-view'); pauseOverlay.classList.add('active-view'); } });
    }
    if (resumeButton) {
        resumeButton.addEventListener('click', () => { isPaused = false; if (pauseOverlay) { pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view'); } renderFrameId = requestAnimationFrame(updateEndlessTrackLoopPipelineFrame); });
    }

    function terminateActiveTrackSessionAndWipeCounters() {
        isGameRunning = false; isPaused = false;
        cancelAnimationFrame(renderFrameId);
        window.removeEventListener('keydown', handleEndlessTrackControllerInputs);
        if (pauseOverlay) { pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view'); }
    }

    const overlayLogoutGameBtn = document.getElementById('abort-run-btn');
    if (overlayLogoutGameBtn) {
        overlayLogoutGameBtn.addEventListener('click', () => {
            isGameRunning = false; isPaused = false;
            cancelAnimationFrame(renderFrameId);
            window.removeEventListener('keydown', handleEndlessTrackControllerInputs);
            
            totalRunsCount++;
            if (sessionScore > highBestScore) highBestScore = sessionScore;
            computedAvgScore = ((computedAvgScore * (totalRunsCount - 1)) + sessionScore) / totalRunsCount;

            if (pauseOverlay) { pauseOverlay.classList.remove('active-view'); pauseOverlay.classList.add('hidden-view'); }
            if (gameStage) { gameStage.classList.remove('active-view'); gameStage.classList.add('hidden-view'); }
            if (loadingScreen) { loadingScreen.classList.remove('hidden-view'); loadingScreen.classList.add('active-view'); }
        });
    }

    function updateEndlessTrackLoopPipelineFrame() {
        if (!isGameRunning || isPaused) return;

        const theme = WORLD_MODES[designatedWorldMode];
        runningTimeline++; sessionScore++;
        
        if (runningTimeline % 80 === 0) sessionCoinsEarned += 1;

        if (liveScoreText) liveScoreText.textContent = `SCORE: ${String(sessionScore).padStart(4, '0')}`;
        if (liveCoinsText) liveCoinsText.textContent = sessionCoinsEarned;

        if (runningTimeline % 1200 === 0) gameSpeed += 0.6;

        if (ctx && theme) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = theme.sky; ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = theme.laneLines; ctx.lineWidth = 3;
            const horizonX = 200; const horizonY = 220;

            [-150, -50, 50, 150].forEach(offset => {
                ctx.beginPath(); ctx.moveTo(horizonX, horizonY);
                ctx.lineTo(horizonX + offset * 2.5, canvas.height); ctx.stroke();
            });

            ctx.fillStyle = theme.tiesColor;
            for (let i = 0; i < 5; i++) {
                let zVal = ((runningTimeline * (gameSpeed * 0.5)) + (i * 85)) % 430;
                let currentLineY = horizonY + zVal;
                if (currentLineY < canvas.height) {
                    ctx.fillRect(horizonX - (zVal*0.35), currentLineY, zVal * 0.7, 3);
                }
            }

            const targetCoordX = TRACK_LANES[activeLaneKey];
            playerX += (targetCoordX - playerX) * 0.25;

            velocityY += 0.55; playerY += velocityY;
            if (playerY >= 520) { playerY = 520; velocityY = 0; }

            draw2DMiniHumanVector(ctx, playerX, playerY, activeSelectionId, runningTimeline);

            if (Math.random() < 0.018) {
                const spaces = [100, 200, 300];
                const lane = spaces[Math.floor(Math.random() * spaces.length)];
                if (!obstacleQueue.some(o => o.lane === lane && o.z < 85)) {
                    obstacleQueue.push({ lane: lane, z: 0 });
                }
            }

            obstacleQueue.forEach((rock) => {
                rock.z += (gameSpeed * 0.75);

                let depthScalar = rock.z / 430;
                let stoneY = horizonY + rock.z;
                let stoneX = horizonX + (rock.lane - horizonX) * depthScalar;
                let w = 34 * depthScalar; let h = 26 * depthScalar;

                ctx.save(); ctx.translate(stoneX, stoneY);
                let rockGradient = ctx.createLinearGradient(-w/2, -h, w/2, 0);
                rockGradient.addColorStop(0, '#95a5a6'); rockGradient.addColorStop(1, '#2c3e50');
                ctx.fillStyle = rockGradient; ctx.strokeStyle = '#34495e'; ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.moveTo(-w/2, 0); ctx.lineTo(-w * 0.4, -h * 0.85);
                ctx.lineTo(0, -h); ctx.lineTo(w * 0.4, -h * 0.75);
                ctx.lineTo(w/2, 0); ctx.closePath();
                ctx.fill(); ctx.stroke();
                ctx.restore();

                if (stoneY > 490 && stoneY < 540) {
                    if (Math.abs(playerX - stoneX) < 28 && playerY > stoneY - h - 15) {
                        isGameRunning = false; cancelAnimationFrame(renderFrameId);
                        triggerIsolatedGameOverOverlayView(); 
                    }
                }
            });
            obstacleQueue = obstacleQueue.filter(o => o.z < 430);
        }

        if (isGameRunning && !isPaused) {
            renderFrameId = requestAnimationFrame(updateEndlessTrackLoopPipelineFrame);
        }
    }

    function triggerIsolatedGameOverOverlayView() {
        window.removeEventListener('keydown', handleEndlessTrackControllerInputs);

        totalRunsCount++;
        if (sessionScore > highBestScore) highBestScore = sessionScore;
        computedAvgScore = ((computedAvgScore * (totalRunsCount - 1)) + sessionScore) / totalRunsCount;

        const scoreValEl = document.getElementById('final-score-val');
        if (scoreValEl) scoreValEl.textContent = String(sessionScore).padStart(4, '0');
        
        const coinsValEl = document.getElementById('final-coins-val');
        if (coinsValEl) coinsValEl.textContent = sessionCoinsEarned;

        fetch('/api/game/over', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: sessionScore, avatar_id: activeSelectionId, coins_earned: sessionCoinsEarned })
        }).catch(err => console.error("Database persistence call failure: ", err));

        if (gameOverOverlay) {
            gameOverOverlay.classList.remove('hidden-view');
            gameOverOverlay.classList.add('active-view');
        }
    }

    // GAME OVER CORE SCREEN BUTTON ACTIONS ROUTERS
    const btnPlayAgain = document.getElementById('go-btn-play-again');
    if (btnPlayAgain) {
        btnPlayAgain.addEventListener('click', () => { 
            if (gameOverOverlay) { gameOverOverlay.classList.remove('active-view'); gameOverOverlay.classList.add('hidden-view'); }
            initializeEndlessSubwayEngineLoop(); 
        });
    }

    const btnHome = document.getElementById('go-btn-home');
    if (btnHome) {
        btnHome.addEventListener('click', () => { 
            if (gameOverOverlay) { gameOverOverlay.classList.remove('active-view'); gameOverOverlay.classList.add('hidden-view'); }
            terminateActiveTrackSessionAndWipeCounters(); 
            routeToHomeCommandHub(); 
        });
    }

    const btnAvatar = document.getElementById('go-btn-avatar');
    if (btnAvatar) {
        btnAvatar.addEventListener('click', () => { 
            if (gameOverOverlay) { gameOverOverlay.classList.remove('active-view'); gameOverOverlay.classList.add('hidden-view'); }
            terminateActiveTrackSessionAndWipeCounters(); 
            if (storeScreen) { storeScreen.classList.remove('hidden-view'); storeScreen.classList.add('active-view'); }
        });
    }

    const btnProfile = document.getElementById('go-btn-profile');
    if (btnProfile) {
        btnProfile.addEventListener('click', () => { 
            if (gameOverOverlay) { gameOverOverlay.classList.remove('active-view'); gameOverOverlay.classList.add('hidden-view'); }
            terminateActiveTrackSessionAndWipeCounters(); 
            if (userProfileModal) { userProfileModal.classList.remove('hidden-view'); userProfileModal.classList.add('active-view'); }
        });
    }

    // PAUSE MODAL OVERLAY LINK HOOK ACTIONS BUTTON MAPS
    const pauseProfileBtn = document.getElementById('pause-profile-btn');
    if (pauseProfileBtn) {
        pauseProfileBtn.addEventListener('click', () => {
            terminateActiveTrackSessionAndWipeCounters();
            if (userProfileModal) { userProfileModal.classList.remove('hidden-view'); userProfileModal.classList.add('active-view'); }
        });
    }

    const pauseHomeBtn = document.getElementById('pause-home-btn');
    if (pauseHomeBtn) {
        pauseHomeBtn.addEventListener('click', () => {
            terminateActiveTrackSessionAndWipeCounters();
            if (homeScreen) { homeScreen.classList.remove('hidden-view'); homeScreen.classList.add('active-view'); }
        });
    }

    // BOOTSTRAP INITIAL LOADING TRIGGER SEQUENCE
    fireInitialBootLoaderPipeline();

});
