/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a single dust particle for visual effects, like from sliding.
 */
export class DustParticle {
    constructor(game, x, y, direction) {
        this.game = game;
        this.x = x;
        this.y = y;

        this.size = Math.random() * 4 + 2; // Small dust motes
        // Move away from the direction of the slide
        const horizontalVelocity = direction === 'right' ? -1 : 1;
        this.speedX = (Math.random() - 0.5) * 2 + horizontalVelocity;
        this.speedY = Math.random() * -1.5 - 0.5; // Slight upward pop
        this.gravity = 0.1;

        this.maxLife = Math.random() * 40 + 20; // Short lifespan
        this.life = this.maxLife;
        // Dusty brown/grey color
        this.color = `rgba(150, 120, 90, ${Math.random() * 0.3 + 0.2})`;

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
        // Fade out as it dies
        context.globalAlpha = Math.max(0, (this.life / this.maxLife) * 0.8);
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}
