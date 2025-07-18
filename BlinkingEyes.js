/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a pair of spooky, blinking eyes that appear in bushes and watch the player.
 */
export class BlinkingEyes {
    constructor(game, x, y) {
        this.game = game; // Reference to the main game object to access the player
        this.x = x;
        this.y = y;

        // --- Eye appearance properties ---
        this.eyeRadiusX = 5;
        this.eyeRadiusY = 6; // This will be animated during blinking
        this.eyeSpacing = 15;
        this.eyeColor = '#FFFF00'; // Bright yellow
        this.glowColor = 'rgba(255, 255, 0, 0.6)';
        
        // --- Pupil properties for tracking ---
        this.pupilRadius = 2.5;
        this.pupilColor = '#000';
        this.maxPupilOffset = this.eyeRadiusX - this.pupilRadius; // Max horizontal shift
        this.currentPupilOffset = 0;

        // --- Blinking state machine ---
        this.blinkState = 'open'; // 'open', 'closing', 'closed', 'opening'
        this.blinkTimer = 0;
        this.currentLidPosition = 1; // 1 = fully open, 0 = fully closed

        // --- Timing for blinking ---
        this.timeUntilNextBlink = this.getRandomBlinkInterval();
        this.closingDuration = 60; // ms
        this.closedDuration = 120; // ms
        this.openingDuration = 80; // ms

        // --- Scared state properties ---
        this.isScared = false;
        this.scaredState = 'none'; // 'fadingOut', 'hidden', 'fadingIn'
        this.scaredTimer = 0;
        this.fadeOutDuration = 1000;  // 1 second to fade out
        this.hiddenDuration = 5000;   // 5 seconds to stay hidden
        this.fadeInDuration = 1000;    // 1 second to fade back in
        this.baseAlpha = 0.85; // Store the initial alpha
        this.alpha = this.baseAlpha;
    }

    /**
     * Generates a random interval before the next blink.
     * @returns {number} Time in milliseconds.
     */
    getRandomBlinkInterval() {
        return Math.random() * 4000 + 2000; // Blink every 2 to 6 seconds
    }

    /**
     * Initiates the fade-out sequence for the eyes.
     */
    scareAway() {
        if (this.isScared) return; // Don't re-trigger
        
        this.isScared = true;
        this.scaredState = 'fadingOut';
        this.scaredTimer = 0;
        
        // Force eyes open to watch them fade
        this.blinkState = 'open';
        this.currentLidPosition = 1;
    }

    /**
     * Updates the blinking animation and pupil tracking.
     * @param {number} deltaTime Time since the last frame.
     */
    update(deltaTime) {
        // If the eyes are scared, handle the fade out and do nothing else.
        if (this.isScared) {
            this.scaredTimer += deltaTime;
            
            switch (this.scaredState) {
                case 'fadingOut':
                    const fadeOutProgress = Math.min(1, this.scaredTimer / this.fadeOutDuration);
                    this.alpha = this.baseAlpha * (1 - fadeOutProgress);
                    if (fadeOutProgress >= 1) {
                        this.scaredState = 'hidden';
                        this.scaredTimer = 0; // Reset timer for the hidden phase
                    }
                    break;
                    
                case 'hidden':
                    this.alpha = 0;
                    if (this.scaredTimer >= this.hiddenDuration) {
                        this.scaredState = 'fadingIn';
                        this.scaredTimer = 0; // Reset timer for the fade-in phase
                    }
                    break;
                    
                case 'fadingIn':
                    const fadeInProgress = Math.min(1, this.scaredTimer / this.fadeInDuration);
                    this.alpha = this.baseAlpha * fadeInProgress;
                    if (fadeInProgress >= 1) {
                        // Reset to normal state
                        this.isScared = false;
                        this.scaredState = 'none';
                        this.alpha = this.baseAlpha;
                    }
                    break;
            }
            return; // Skip normal behavior while scared
        }

        // --- Update pupil tracking ---
        if (this.game.player) {
            const playerCenterX = this.game.player.x + this.game.player.width / 2;
            let targetPupilOffset = 0;
            
            // Determine direction to look
            const direction = playerCenterX - this.x;
            
            // Move pupils towards the player, clamped by max offset. The division provides sensitivity control.
            targetPupilOffset = Math.max(-this.maxPupilOffset, Math.min(this.maxPupilOffset, direction / 50));
            
            // Smoothly move the pupil towards the target offset
            const easing = 0.08;
            this.currentPupilOffset += (targetPupilOffset - this.currentPupilOffset) * easing;
        }

        // --- Update blinking state ---
        this.blinkTimer += deltaTime;
        switch (this.blinkState) {
            case 'open':
                if (this.blinkTimer >= this.timeUntilNextBlink) {
                    this.blinkState = 'closing';
                    this.blinkTimer = 0;
                }
                break;
            case 'closing':
                this.currentLidPosition = Math.max(0, 1 - (this.blinkTimer / this.closingDuration));
                if (this.blinkTimer >= this.closingDuration) {
                    this.blinkState = 'closed';
                    this.blinkTimer = 0;
                }
                break;
            case 'closed':
                this.currentLidPosition = 0;
                if (this.blinkTimer >= this.closedDuration) {
                    this.blinkState = 'opening';
                    this.blinkTimer = 0;
                }
                break;
            case 'opening':
                this.currentLidPosition = Math.min(1, this.blinkTimer / this.openingDuration);
                if (this.blinkTimer >= this.openingDuration) {
                    this.blinkState = 'open';
                    this.blinkTimer = 0;
                    this.timeUntilNextBlink = this.getRandomBlinkInterval();
                }
                break;
        }
    }

    /**
     * Draws the blinking eyes and pupils on the canvas.
     * @param {CanvasRenderingContext2D} context The drawing context.
     */
    draw(context) {
        if (this.alpha <= 0.01) {
            return; // Don't draw if faded out
        }
        
        // If not scared and the eye is closed, don't draw.
        // During the scared sequence, we want to see the fade, so we ignore the blink state.
        if (!this.isScared && this.currentLidPosition <= 0.05) {
            return;
        }

        const animatedRadiusY = this.eyeRadiusY * this.currentLidPosition;

        context.save();
        context.globalAlpha = this.alpha;

        // --- Draw Eye Glow ---
        context.shadowColor = this.glowColor;
        context.shadowBlur = 10;
        
        // --- Draw Eyeballs (the yellow part) ---
        context.fillStyle = this.eyeColor;
        // Left eye
        context.beginPath();
        context.ellipse(this.x - this.eyeSpacing / 2, this.y, this.eyeRadiusX, animatedRadiusY, 0, 0, Math.PI * 2);
        context.fill();
        // Right eye
        context.beginPath();
        context.ellipse(this.x + this.eyeSpacing / 2, this.y, this.eyeRadiusX, animatedRadiusY, 0, 0, Math.PI * 2);
        context.fill();

        // --- Draw Pupils ---
        // Pupils don't get a glow.
        context.shadowBlur = 0; 
        context.shadowColor = 'transparent';
        context.fillStyle = this.pupilColor;

        const pupilRadiusY = this.pupilRadius * this.currentLidPosition; // Pupil squashes with the eye

        // Left pupil
        context.beginPath();
        context.ellipse(this.x - this.eyeSpacing / 2 + this.currentPupilOffset, this.y, this.pupilRadius, pupilRadiusY, 0, 0, Math.PI * 2);
        context.fill();
        
        // Right pupil
        context.beginPath();
        context.ellipse(this.x + this.eyeSpacing / 2 + this.currentPupilOffset, this.y, this.pupilRadius, pupilRadiusY, 0, 0, Math.PI * 2);
        context.fill();

        context.restore();
    }
}