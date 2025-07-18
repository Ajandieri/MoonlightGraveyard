/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a single sparkle particle for visual effects on the treasure chest.
 */
export class SparkleParticle {
    constructor(chest) {
        this.chest = chest;
        // Spawn sparkles in a radius around the chest's center
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (this.chest.width / 2 + 10) + 25;
        this.x = this.chest.x + this.chest.width / 2 + Math.cos(angle) * radius;
        this.y = this.chest.y + this.chest.height / 2 + Math.sin(angle) * radius;
        
        this.size = Math.random() * 2.5 + 1;
        this.maxLife = Math.random() * 60 + 40; // time-to-live for a sparkle
        this.life = this.maxLife;
        this.color = `rgba(255, 223, 100, 1)`; // Gold color
        
        this.markedForDeletion = false;
    }

    /**
     * Updates the particle's lifecycle.
     */
    update() {
        this.life--;
        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    /**
     * Draws the particle with a glowing effect, fading out as it expires.
     * @param {CanvasRenderingContext2D} context The drawing context.
     */
    draw(context) {
        const opacity = Math.max(0, (this.life / this.maxLife));
        context.save();
        context.globalAlpha = opacity;
        context.fillStyle = this.color;
        context.shadowColor = '#ffd700'; // Gold glow
        context.shadowBlur = 8;
        
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
    }
}