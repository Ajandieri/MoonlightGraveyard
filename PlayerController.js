

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Handles keyboard inputs for player actions.
 * A simple set-based implementation to track currently pressed keys.
 */
class InputHandler {
    constructor() {
        this.keys = new Set();
        this.handleKeyDown = (e) => this.keys.add(e.key.toLowerCase());
        this.handleKeyUp = (e) => this.keys.delete(e.key.toLowerCase());
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    detach() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}

/**
 * Controls the player character's state (movement, animation) based on user input.
 */
export class PlayerController {
    /**
     * @param {Player} player The player instance to control.
     */
    constructor(player) {
        this.player = player;
        this.inputHandler = new InputHandler();
        this.playerSpeed = 5; // Movement speed in pixels per frame
        this.actionKeysState = {}; // For one-click actions

        // --- State for A/D confusion effect ---
        this.confusedTimer = 0;
        this.confusedSoundPlayed = false;
    }

    /**
     * Removes all keyboard listeners to disable player control.
     */
    detach() {
        this.inputHandler.detach();
    }

    /**
     * This method should be called in the main game loop to update the player's state.
     * @param {number} deltaTime Time since last frame, needed for timed events.
     */
    update(deltaTime) {
        const keys = this.inputHandler.keys;
        const animManager = this.player.animationManager;

        // --- Update one-click action states ---
        const jumpPressed = keys.has(' ') && !this.actionKeysState[' '];
        const shootPressed = keys.has('q') && !this.actionKeysState['q'];
        const meleePressed = keys.has('w') && !this.actionKeysState['w'];

        this.actionKeysState[' '] = keys.has(' ');
        this.actionKeysState['q'] = keys.has('q');
        this.actionKeysState['w'] = keys.has('w');
        // --- End one-click logic ---

        const isAttacking = ['melee', 'shoot'].includes(animManager.currentAnimationName);
        if (!isAttacking) {
            this.player.attackStartedOnGround = false;
        }

        // --- Handle input states ---
        const isMovingLeft = keys.has('a');
        const isMovingRight = keys.has('d');
        const bothMoveKeysPressed = isMovingLeft && isMovingRight;

        // --- Handle confused state (A and D pressed at the same time) ---
        if (bothMoveKeysPressed) {
            this.confusedTimer += deltaTime;
            if (this.confusedTimer > 500 && !this.confusedSoundPlayed) {
                this.player.audioManager.playSound('WhereToGo');
                this.confusedSoundPlayed = true;
            }
        } else {
            this.confusedTimer = 0;
            this.confusedSoundPlayed = false;
        }

        // --- Animation State Machine ---
        if (this.player.justLanded) {
            // High-priority check: if we just landed, override other animations,
            // but only if we are NOT in the middle of an attack.
            if (!isAttacking) {
                if (bothMoveKeysPressed) {
                    animManager.PlayerIdleAnim();
                } else if (isMovingLeft || isMovingRight) {
                    animManager.PlayerRunAnim();
                } else {
                    animManager.PlayerIdleAnim();
                }
            }
        } else if (!isAttacking) {
            // Only allow new actions if not currently in an attack animation.
            if (this.player.isOnGround()) {
                if (jumpPressed) {
                    this.player.jump();
                } else if (shootPressed) {
                    this.player.shoot();
                } else if (meleePressed) {
                    this.player.meleeAttack();
                } else if (bothMoveKeysPressed) {
                    animManager.PlayerIdleAnim();
                } else if (isMovingLeft || isMovingRight) {
                    animManager.PlayerRunAnim();
                } else {
                    animManager.PlayerIdleAnim();
                }
            } else {
                // --- Aerial Actions ---
                if (shootPressed) {
                    this.player.shoot();
                } else if (meleePressed) {
                    this.player.meleeAttack();
                } else if (animManager.currentAnimationName !== 'jump') {
                    // Default to jump animation if in the air and not attacking.
                    animManager.PlayerJumpAnim();
                }
            }
        }

        // --- Horizontal Movement & Direction ---
        const isActionLocked = isAttacking && this.player.attackStartedOnGround;

        if (isActionLocked) {
            // Lock horizontal movement entirely if an action was initiated on the ground.
            this.player.speedX = 0;
        } else {
            // Check for the "slowed on landing" condition for both melee and shooting.
            const isSlowedOnLanding = this.player.isOnGround() && isAttacking && !this.player.attackStartedOnGround;
            const currentSpeed = isSlowedOnLanding ? this.playerSpeed * 0.4 : this.playerSpeed; // Reduce speed to 40%

            // Add sliding dust effect if slowed and trying to move.
            if (isSlowedOnLanding && (isMovingLeft || isMovingRight) && !bothMoveKeysPressed) {
                const footX = this.player.x + this.player.width / 2;
                const footY = this.player.y + this.player.height;
                this.player.game.createDustEffect(footX+5, footY-10, this.player.direction);
            }

            // Allow movement control but potentially at a reduced speed.
            if (isMovingRight && !isMovingLeft) {
                this.player.speedX = currentSpeed;
                this.player.direction = 'right';
            } else if (isMovingLeft && !isMovingRight) {
                this.player.speedX = -currentSpeed;
                this.player.direction = 'left';
            } else {
                // This covers both keys pressed, or neither key pressed.
                this.player.speedX = 0;
            }
        }
    }
}