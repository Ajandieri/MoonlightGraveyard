

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { RESUME_SCROLL_DATA } from './ResumeScrollData.js';

/**
 * Represents a paper scroll that appears from a treasure chest.
 * It features a pop-up animation with scaling and rotation.
 */
export class ResumeScroll {
    /**
     * @param {Game} game The main game object.
     * @param {number} chestX The x-coordinate of the parent chest.
     * @param {number} chestY The y-coordinate of the parent chest.
     */
    constructor(game, chestX, chestY) {
        this.game = game;

        // --- Adjustable Properties ---
        this.finalWidth = 100;
        this.finalHeight = 100;
        this.animationDuration = 800; // in milliseconds
        this.targetScale = 1.0;
        this.rotation = -Math.PI / 8; // Slight tilt for style
        this.popVerticalOffset = -this.finalHeight / 2; // How high it pops relative to the chest's top
        
        this.x = chestX + (128 - this.finalWidth) / 2; // Center horizontally on the chest
        this.y = chestY + this.popVerticalOffset;
        
        // Get the preloaded image from the game's asset manager
        this.image = this.game.assets.resumeScroll;
        this.isLoaded = !!this.image; // Should always be true if preloading works
        
        if (!this.isLoaded) {
            console.error("ResumeScroll was created, but the image asset was not preloaded!");
        }
        
        this.state = 'appearing'; // 'appearing', 'idle'
        this.animationTimer = 0;
        this.currentScale = 0;

        this.awaitingDialogueTrigger = false; // Flag to signal the end sequence
        this.dialogueTriggerTimer = 0; // Timer for the delay
        this.dialogueDelayStarted = false; // Flag to start the timer
    }

    /**
     * Updates the scroll's animation state.
     * @param {number} deltaTime Time since the last frame.
     */
    update(deltaTime) {
        if (this.state === 'appearing') {
            this.animationTimer += deltaTime;
            let progress = Math.min(1, this.animationTimer / this.animationDuration);
            
            // Use an "ease-out" cubic function for a nice "pop" effect.
            progress = 1 - Math.pow(1 - progress, 3);
            
            this.currentScale = this.targetScale * progress;
            
            if (this.animationTimer >= this.animationDuration) {
                this.state = 'idle';
                this.dialogueDelayStarted = true; // Start the delay timer
            }
        }

        // If the animation is done and the delay has started, run the timer.
        if (this.dialogueDelayStarted && !this.awaitingDialogueTrigger) {
            this.dialogueTriggerTimer += deltaTime;
            // Once the timer exceeds the configured delay, trigger the dialogue.
            if (this.dialogueTriggerTimer >= (RESUME_SCROLL_DATA.dialogueStartDelay || 0)) {
                this.awaitingDialogueTrigger = true;
            }
        }
    }

    /**
     * Draws the scroll on the canvas, applying its current scale and rotation.
     * @param {CanvasRenderingContext2D} context The drawing context.
     */
    draw(context) {
        if (!this.isLoaded) return;

        context.save();
        
        // We translate to the object's center to scale and rotate from the middle.
        const centerX = this.x + this.finalWidth / 2;
        const centerY = this.y + this.finalHeight / 2;
        
        context.translate(centerX, centerY);
        context.rotate(this.rotation);
        context.scale(this.currentScale, this.currentScale);
        
        // Draw the image centered at the new (0,0) origin.
        context.drawImage(this.image, -this.finalWidth / 2, -this.finalHeight / 2, this.finalWidth, this.finalHeight);
        
        context.restore();
    }
}