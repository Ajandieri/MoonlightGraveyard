

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a projectile fired by the player.
 */
export class Bullet {
    constructor(game, x, y, direction) {
        this.game = game;
        this.width = 15;
        this.height = 5;
        this.x = x;
        this.y = y;
        this.direction = direction;
        
        this.speed = 15;
        this.damage = 20; // Corrected damage
        
        this.speedX = this.direction === 'right' ? this.speed : -this.speed;
        
        this.markedForDeletion = false;
        
        this.startX = x;
        this.maxDistance = 700; // Corrected max travel distance in pixels
        this.alpha = 1;
    }

    /**
     * Updates the bullet's position and checks for world boundaries and max range.
     */
    update() {
        this.x += this.speedX;
        const distanceTraveled = Math.abs(this.x - this.startX);

        // Fade out logic
        const fadeStartDistance = this.maxDistance * 0.8;
        if (distanceTraveled > fadeStartDistance) {
            const fadeRange = this.maxDistance - fadeStartDistance;
            this.alpha = 1 - (distanceTraveled - fadeStartDistance) / fadeRange;
        }

        // Mark for deletion if it goes off the entire world's screen OR exceeds max range
        if (this.x < 0 || this.x > this.game.worldWidth || distanceTraveled >= this.maxDistance) {
            this.markedForDeletion = true;
        }
    }

    /**
     * Draws the bullet with a glowing effect.
     * @param {CanvasRenderingContext2D} context
     */
    draw(context) {
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        
        // Main bullet color
        context.fillStyle = '#fff';
        context.shadowColor = '#f0e68c'; // Khaki glow
        context.shadowBlur = 15;
        
        context.beginPath();
        context.roundRect(this.x, this.y, this.width, this.height, 4);
        context.fill();

        context.restore();
    }
}