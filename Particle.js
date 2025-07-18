/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a single particle for visual effects like blood splatters.
 */
export class Particle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        
        // Randomize properties for a splash effect
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * -10 - 2; // Initial upward burst
        this.gravity = 0.5;
        this.lifespan = 100; // Time before it starts fading
        this.color = `rgba(150, 0, 0, ${Math.random() * 0.5 + 0.5})`; // Shades of red
        
        this.markedForDeletion = false;
    }

    /**
     * Updates the particle's state.
     * @param {number} deltaTime - Time since last frame.
     */
    update(deltaTime) {
        this.lifespan -= deltaTime / 10;
        if (this.lifespan < 0) {
            this.markedForDeletion = true;
        }
        
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
    }

    /**
     * Draws the particle.
     * @param {CanvasRenderingContext2D} context - The drawing context.
     */
    draw(context) {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
    }
}