/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a dust/footstep particle for effects like landing or running.
 */
export class FootstepParticle {
    constructor(game, x, y, direction = null) {
        this.game = game;
        this.x = x;
        this.y = y;

        this.size = Math.random() * 4 + 2; // Small motes

        // If a direction is given (for running), kick particles backwards.
        // Otherwise (for landing), create a symmetrical puff.
        if (direction) {
            const horizontalVelocity = direction === 'right' ? -1.5 : 1.5;
            this.speedX = (Math.random() - 0.5) * 1 + horizontalVelocity;
        } else {
            this.speedX = (Math.random() - 0.5) * 3; // Symmetrical spread
        }
        
        this.speedY = Math.random() * -1.5 - 0.5; // Slight upward pop
        this.gravity = 0.08;

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
