

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AnimationManager } from './AnimationManager.js';

/**
 * Represents the player character.
 */
export class Player {
    constructor(game, animationsConfig, environment, audioManager) {
        this.game = game;
        this.environment = environment;
        this.audioManager = audioManager;
        this.width = 128; // The destination width
        this.height = 128; // The destination height
        
        // Tighter hitbox for more precise collisions
        this.hitboxWidth = 40;
        this.hitboxOffsetX = (this.width - this.hitboxWidth) / 2;
        
        this.x = (this.game.width - this.width) / 2;
        this.gravity = 1;
        this.jumpStrength = -22;
        this.verticalOffset = 10; // To close the visual gap with the ground
        this.y = this.environment.groundLevel - this.height + this.verticalOffset;
        this.speedX = 0;
        this.speedY = 0;
        this.isGrounded = true; // Start grounded
        this.justLanded = false; // Flag for the frame of landing
        this.direction = 'right'; // 'left' or 'right'
        
        this.isFrozen = false; // Player state for end-game sequence

        this.animationManager = new AnimationManager(this, animationsConfig, 'Player');
        this.enemiesHitThisSwing = [];
        this.hasFiredThisShot = false;
        this.attackStartedOnGround = false; // Flag to track attack context

        this.shootCooldown = 500; // Milliseconds
        this.lastShotTime = 0;

        // Add footstep audio properties
        this.isPlayingFootsteps = false;
        this.lastFrameForFootstep = -1;
    }

    /**
     * Locks the player in place with an idle animation.
     * Used for the final sequence when the chest is opened.
     */
    forceIdleAndFreeze() {
        this.isFrozen = true;
        this.speedX = 0;
        this.speedY = 0; // Stop all movement immediately, including gravity
        this.animationManager.PlayerIdleAnim();
        
        // Ensure footstep sounds stop when frozen
        if (this.isPlayingFootsteps) {
            this.audioManager.stopLoopingSound('footsteps');
            this.isPlayingFootsteps = false;
        }
    }

    /**
     * Checks if the player is standing on a solid surface.
     * @returns {boolean}
     */
    isOnGround() {
        return this.isGrounded;
    }

    /**
     * Initiates a player jump if they are on a solid surface.
     */
    jump() {
        if (this.isOnGround()) {
            this.speedY = this.jumpStrength;
            this.animationManager.PlayerJumpAnim();
            this.audioManager.playSound('jump', true);
        }
    }

    /**
     * Initiates a melee attack.
     */
    meleeAttack() {
        this.attackStartedOnGround = this.isOnGround(); // Set flag based on current state
        this.animationManager.PlayerMeleeAnim();
        this.enemiesHitThisSwing = []; // Reset the hit list for the new swing.
        this.audioManager.playSound('melee', true);
    }

    /**
     * Initiates a ranged attack, respecting a cooldown.
     */
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shootCooldown) {
            return; // Cooldown is active, do nothing.
        }
        
        this.attackStartedOnGround = this.isOnGround(); // Set flag based on current state
        this.lastShotTime = currentTime;
        this.animationManager.PlayerShootAnim();
        this.audioManager.playSound('pistolShoot', true);
        this.hasFiredThisShot = false; // Reset the flag for the new shot
    }

    /**
     * Updates the player's state.
     * @param {number} deltaTime - Time since the last frame.
     */
    update(deltaTime) {
        // Reset the justLanded flag at the start of each update cycle.
        this.justLanded = false;
        const wasGrounded = this.isGrounded;

        // If frozen, stop sounds, update animation, and do nothing else.
        if (this.isFrozen) {
            if (this.isPlayingFootsteps) {
                this.audioManager.stopLoopingSound('footsteps');
                this.isPlayingFootsteps = false;
            }
            this.animationManager.update(deltaTime);
            return;
        }

        // If game is over, stop sounds, update animation, and do nothing else.
        if (this.game.gameState === 'GAME_OVER') {
            if (this.isPlayingFootsteps) {
                this.audioManager.stopLoopingSound('footsteps');
                this.isPlayingFootsteps = false;
            }
            this.animationManager.update(deltaTime);
            return;
        }

        // Horizontal position is updated based on speed set by the controller
        this.x += this.speedX;
        
        const previousY = this.y;

        // Apply gravity and update vertical position
        this.speedY += this.gravity;
        this.y += this.speedY;

        let onSolidSurface = false;
        
        const playerHitboxX = this.x + this.hitboxOffsetX;

        // Platform collision (only check if falling or on it)
        if (this.speedY >= 0) {
            for (const platform of this.environment.platforms) {
                // Check for horizontal overlap and if the player was previously above the platform
                if (
                    playerHitboxX < platform.x + platform.width &&
                    playerHitboxX + this.hitboxWidth > platform.x &&
                    previousY + this.height <= platform.y + this.verticalOffset &&
                    this.y + this.height >= platform.y
                ) {
                    this.y = platform.y - this.height + this.verticalOffset; // Snap to the top of the platform with offset
                    this.speedY = 0;
                    onSolidSurface = true;
                    break;
                }
            }
        }

        // Ground collision (if no platform was landed on)
        if (!onSolidSurface && this.y + this.height > this.environment.groundLevel + this.verticalOffset) {
            this.y = this.environment.groundLevel - this.height + this.verticalOffset; // Snap to ground with offset
            this.speedY = 0;
            onSolidSurface = true;
        }
        
        this.isGrounded = onSolidSurface;

        // Check for the landing event
        if (!wasGrounded && this.isGrounded) {
            this.justLanded = true;
            // Add particle effect for landing
            const footY = this.y + this.height - 5; // A bit higher than bottom
            const footX = this.x + this.width / 2;
            this.game.createFootstepEffect(footX, footY, 8, null);
        }
        
        // Footstep sound logic
        const isRunning = this.isOnGround() && this.speedX !== 0;
        if (isRunning && !this.isPlayingFootsteps) {
            this.audioManager.startLoopingSound('footsteps');
            this.isPlayingFootsteps = true;
        } else if (!isRunning && this.isPlayingFootsteps) {
            this.audioManager.stopLoopingSound('footsteps');
            this.isPlayingFootsteps = false;
        }

        // Keep player within horizontal WORLD bounds
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > this.game.worldWidth - this.width) {
            this.x = this.game.worldWidth - this.width;
        }

        this.animationManager.update(deltaTime);

        // Add running footstep particles
        if (this.animationManager.currentAnimationName === 'run' && this.isOnGround()) {
            const frame = this.animationManager.currentFrame;
            // Trigger on frames where a foot would kick up dust
            if ((frame === 2 || frame === 6) && frame !== this.lastFrameForFootstep) {
                const footY = this.y + this.height - 5;
                const footX = this.x + this.width / 2;
                this.game.createFootstepEffect(footX, footY, 2, this.direction);
            }
            this.lastFrameForFootstep = frame;
        } else {
            this.lastFrameForFootstep = -1; // Reset when not running or in air
        }
    }

    /**
     * Draws the player on the canvas.
     * @param {CanvasRenderingContext2D} context - The drawing context.
     */
    draw(context) {
        // Fallback drawing if images are not loaded yet
        if (!this.animationManager.isLoaded) {
            context.fillStyle = 'rgba(255, 255, 255, 0.5)';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'red';
            context.textAlign = 'center';
            context.font = '16px "Segoe UI"';
            context.fillText('Loading assets...', this.x + this.width / 2, this.y + this.height / 2);
            return;
        }

        context.save();
        if (this.direction === 'left') {
            context.scale(-1, 1);
            this.animationManager.draw(context, -this.x - this.width, this.y, this.width, this.height);
        } else {
            this.animationManager.draw(context, this.x, this.y, this.width, this.height);
        }
        context.restore();
    }
}