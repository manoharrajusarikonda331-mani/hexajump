/* ==========================================================================
   HEXAJUMP - GAME ENGINE CORE CLIENT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Node Selectors
    const avatarCards = document.querySelectorAll('.avatar-card');
    const startButton = document.getElementById('start-btn');
    const launcherScreen = document.getElementById('launcher-screen');
    const gameCanvas = document.getElementById('gameCanvas');
    
    // Core Engine State Tracker
    let selectedAvatar = null;
    let canvasContext = null;
    let gameLoopActive = false;

    // Initialize Avatar Selector Event Listeners
    avatarCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active selection layout states from all nodes
            avatarCards.forEach(c => c.classList.remove('selected'));
            
            // Apply unique selection signature to the active element
            card.classList.add('selected');
            
            // Extract core data attribute properties
            selectedAvatar = card.getAttribute('data-avatar');
            
            // Enable the Launch action control button
            startButton.disabled = false;
        });
    });

    // Initialize Launcher Engine Click Event
    startButton.addEventListener('click', () => {
        if (!selectedAvatar) return;

        // Transition UI: Hide launcher layout, uncover gameplay canvas viewport
        launcherScreen.classList.add('hidden');
        gameCanvas.classList.remove('hidden');

        // Initialize HTML5 Canvas Context Environment
        canvasContext = gameCanvas.getContext('2d');
        gameLoopActive = true;

        // Kickoff Core Render Loop Animation Frame
        requestAnimationFrame(runGameEngineLoop);
    });

    /**
     * Core Render Loop Frame Runner
     * Executes programmatic refresh updates at 60 FPS
     */
    function runGameEngineLoop() {
        if (!gameLoopActive) return;

        // Clear Viewport Buffer Matrix
        canvasContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

        // Draw Placeholder Engine Verification Text
        canvasContext.fillStyle = '#6c7a89'; // Engineering gray
        canvasContext.font = '14px Segoe UI';
        canvasContext.textAlign = 'center';
        canvasContext.fillText(`HEXAJUMP ENGINE INITIALIZED // ACTIVE AVATAR: ${selectedAvatar.toUpperCase()}`, gameCanvas.width / 2, gameCanvas.height / 2);

        // Dynamic Loop Cascade Call
        requestAnimationFrame(runGameEngineLoop);
    }
});
