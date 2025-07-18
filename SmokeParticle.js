/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a single smoke particle for visual effects, like from an opening chest.
 */
export class SmokeParticle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        
        this.size = Math.random() * 15 + 10; // Increased size for more presence
        this.speedX = Math.random() * 2.5 - 1.25; // Slightly wider horizontal drift
        this.speedY = Math.random() * -2.0 - 0.8; // More initial upward velocity
        this.gravity = 0.01;
        
        this.maxLife = Math.random() * 100 + 80; // Particles last longer
        this.life = this.maxLife;
        // Whiter smoke color for more contrast and intensity
        this.color = `rgba(220, 220, 220, ${Math.random() * 0.3 + 0.3})`;
        
        this.markedForDeletion = false;
    }

    /**
     * Updates the particle's state (position and lifespan).
     */
    update() {
        this.life--;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
        
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
    }

    /**
     * Draws the particle, fading it out as its life decreases.
     * @param {CanvasRenderingContext2D} context - The drawing context.
     */
    draw(context) {
        context.save();
        // Fade out as it dies, with a higher base opacity
        context.globalAlpha = Math.max(0, (this.life / this.maxLife) * 0.7); 
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}