

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AnimationManager } from './AnimationManager.js';
import { ENEMY_ANIMATIONS } from './EnemyAnimationData.js';

/**
 * Represents an enemy character.
 */
export class Enemy {
    constructor(game, x, y, environment, audioManager) {
        this.game = game;
        this.environment = environment;
        this.audioManager = audioManager;
        this.width = 128;
        this.height = 128;

        // Tighter hitbox for more precise collisions
        this.hitboxWidth = 40;
        this.hitboxOffsetX = (this.width - this.hitboxWidth) / 2;
        
        this.x = x;
        this.y = y;
        this.speedX = -1; // Start by moving left
        this.speedY = 0;
        this.direction = 'left';

        this.patrolStartX = x;
        this.patrolRange = 150; // How far to walk from the start point

        this.gravity = 1;
        this.verticalOffset = 10; // To close the visual gap with the ground
        
        this.animationManager = new AnimationManager(this, ENEMY_ANIMATIONS, 'Enemy');

        this.health = 100;
        this.maxHealth = 100;
        this.isDead = false;
        this.markedForDeletion = false;
        this.deathTimer = 0;
        this.timeUntilRemoval = 500; // ms to wait before removing corpse
        this.alpha = 1;
        this.yAtCorpseStart = 0;
    }

    /**
     * Reduces the enemy's health when it takes damage.
     * @param {number} damage - The amount of damage to inflict.
     */
    takeDamage(damage) {
        if (this.isDead) return;
        this.health -= damage;

        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
            this.speedX = 0;
            this.animationManager.EnemyDeadAnim();
            this.audioManager.playSound('enemyDeath', true);
        } else {
            this.audioManager.playSound('enemyHit', true);
        }
    }

    /**
     * Updates the enemy's state.
     * @param {number} deltaTime - Time since the last frame.
     */
    update(deltaTime) {
        // If the game is over, stop all AI and revert to idle, but keep animating.
        if (this.game.gameState === 'GAME_OVER') {
            if (!this.isDead) {
                this.animationManager.EnemyIdleAnim();
            }
            this.animationManager.update(deltaTime);
            return;
        }

        if (!this.isDead) {
            // --- AI & Horizontal Movement ---
            this.x += this.speedX;

            // Check patrol boundaries and turn around
            if (this.direction === 'left' && this.x < this.patrolStartX - this.patrolRange) {
                this.direction = 'right';
                this.speedX = 1;
            } else if (this.direction === 'right' && this.x > this.patrolStartX) {
                this.direction = 'left';
                this.speedX = -1;
            }
            
            // --- Animation Control ---
            if(this.speedX !== 0) {
                this.animationManager.EnemyWalkAnim();
            } else {
                this.animationManager.EnemyIdleAnim();
            }

            // --- Physics & Vertical Movement ---
            const previousY = this.y;
            this.speedY += this.gravity;
            this.y += this.speedY;

            let landedOnPlatform = false;
            
            const enemyHitboxX = this.x + this.hitboxOffsetX;
            
            if (this.speedY > 0) {
                for (const platform of this.environment.platforms) {
                    if (
                        enemyHitboxX < platform.x + platform.width &&
                        enemyHitboxX + this.hitboxWidth > platform.x &&
                        previousY + this.height <= platform.y + this.verticalOffset &&
                        this.y + this.height >= platform.y
                    ) {
                        this.y = platform.y - this.height + this.verticalOffset;
                        this.speedY = 0;
                        landedOnPlatform = true;
                        break;
                    }
                }
            }

            if (!landedOnPlatform && this.y + this.height > this.environment.groundLevel) {
                this.y = this.environment.groundLevel - this.height + this.verticalOffset;
                this.speedY = 0;
            }
        } else {
            // If dead, check if ready to be removed after animation
            const anim = this.animationManager.currentAnimation;
            if (anim && this.animationManager.currentFrame >= anim.frames - 1) {
                // If this is the first frame of the sinking, capture the starting Y
                if (this.deathTimer === 0) {
                    this.yAtCorpseStart = this.y;
                }
                
                this.deathTimer += deltaTime;
                const sinkDuration = this.timeUntilRemoval;
                const sinkProgress = Math.min(1, this.deathTimer / sinkDuration);
                const sinkDepth = 40; // How many pixels to sink

                this.alpha = 1 - sinkProgress;
                this.y = this.yAtCorpseStart + (sinkDepth * sinkProgress);

                if (this.deathTimer > sinkDuration) {
                    this.markedForDeletion = true;
                }
            }
        }
        
        this.animationManager.update(deltaTime);
    }

    /**
     * Draws the enemy and its health bar on the canvas.
     * @param {CanvasRenderingContext2D} context - The drawing context.
     */
    draw(context) {
        context.save();
        context.globalAlpha = this.alpha;

        // Draw health bar if damaged
        if (this.health < this.maxHealth && !this.isDead) {
            const barWidth = this.width * 0.8;
            const barHeight = 10;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - barHeight - 10;
            const healthPercentage = this.health / this.maxHealth;

            // Health bar background
            context.fillStyle = '#333';
            context.beginPath();
            context.roundRect(barX, barY, barWidth, barHeight, 5);
            context.fill();
            
            // Health bar foreground
            context.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#FFC107' : '#F44336';
            context.beginPath();
            context.roundRect(barX, barY, barWidth * healthPercentage, barHeight, 5);
            context.fill();

             // Health bar border
             context.strokeStyle = '#222';
             context.beginPath();
             context.roundRect(barX, barY, barWidth, barHeight, 5);
             context.stroke();
        }

        // Draw the enemy sprite
        if (!this.animationManager.isLoaded) {
            context.fillStyle = 'rgba(255, 0, 0, 0.5)';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.font = '16px "Segoe UI"';
            context.fillText('Loading enemy...', this.x + this.width / 2, this.y + this.height / 2);
            context.restore();
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

        context.restore();
    }
}