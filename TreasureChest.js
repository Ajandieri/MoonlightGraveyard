

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AnimationManager } from './AnimationManager.js';
import { TREASURE_CHEST_ANIMATIONS } from './TreasureChestAnimationData.js';
import { SparkleParticle } from './SparkleParticle.js';

/**
 * Represents an interactive treasure chest.
 */
export class TreasureChest {
    constructor(game, x, audioManager) {
        this.game = game;
        this.audioManager = audioManager;
        this.width = 128; 
        this.height = 128;
        this.x = x;
        
        // The chest's y position is determined by the environment's ground level.
        // This adjustment raises it slightly to be better aligned with the player.
        this.y = this.game.environment.groundLevel - this.height; 
        
        this.state = 'closed'; // 'closed', 'opening', 'open'
        this.hasBeenOpened = false;
        
        this.animationManager = new AnimationManager(this, TREASURE_CHEST_ANIMATIONS, 'TreasureChest');
        this.animationManager.setAnimation('idle_closed');

        // For the interaction indicator effect
        this.sparkles = [];
        this.sparkleTimer = 0;
        this.sparkleInterval = 100; // ms between sparkle emissions
        
        // --- New properties for interaction hint ---
        this.interactionRange = 200; // The distance at which the hint appears
        this.isPlayerInRange = false;
    }

    /**
     * Opens the chest if it's currently closed.
     */
    open() {
        if (this.state === 'closed') {
            this.game.freezePlayerForEnd(); // Freeze the player immediately

            this.state = 'opening';
            this.animationManager.setAnimation('opening');
            this.hasBeenOpened = true;
            this.audioManager.playSound('chestOpen');
            
            // Create a more intense puff of smoke when the chest opens
            this.game.createSmokeEffect(this.x + this.width / 2, this.y + this.height / 2);

            // Tell the game to spawn a resume scroll at the chest's location
            this.game.spawnResumeScroll(this.x, this.y);
        }
    }

    /**
     * Updates the chest's animation state and its sparkle effect.
     * @param {number} deltaTime - Time since the last frame.
     */
    update(deltaTime) {
        this.animationManager.update(deltaTime);

        // After the 'opening' animation finishes, switch to the 'idle_open' state.
        if (this.state === 'opening' && this.animationManager.currentAnimationName !== 'opening') {
            this.state = 'open';
            this.animationManager.setAnimation('idle_open');
        }

        // --- Player proximity check for hint ---
        if (this.state === 'closed') {
            const player = this.game.player;
            if (player) {
                const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
                const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.isPlayerInRange = distance < this.interactionRange;
            }
        } else {
            this.isPlayerInRange = false; // Turn off hint if chest is opened or opening
        }

        // --- Update Sparkle Effect ---
        // Only sparkle when the chest is closed and waiting to be opened.
        if (this.state === 'closed') {
            this.sparkleTimer += deltaTime;
            if (this.sparkleTimer > this.sparkleInterval) {
                this.sparkleTimer = 0;
                // Add a couple of sparkles per interval for a gentle effect
                for (let i = 0; i < 2; i++) {
                    this.sparkles.push(new SparkleParticle(this));
                }
            }
        }
        
        // Update all active sparkles and remove the ones that have expired.
        this.sparkles.forEach(sparkle => sparkle.update());
        this.sparkles = this.sparkles.filter(s => !s.markedForDeletion);
    }

    /**
     * Draws a hint to interact with the chest.
     * @param {CanvasRenderingContext2D} context The drawing context.
     */
    drawHint(context) {
        const hintText1 = "Press ";
        const hintKey = "E";
        const hintText2 = " to Open";

        context.save();
        context.font = '22px "Georgia", serif';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        context.shadowColor = 'rgba(0, 0, 0, 0.9)';
        context.shadowBlur = 6;
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 1;

        const hintX = this.x + this.width / 2;
        const hintY = this.y - 20;

        // Measure widths of each part to manually center the composite text
        const text1Width = context.measureText(hintText1).width;
        // Temporarily set font to bold to measure the key correctly
        const originalFont = context.font;
        context.font = 'bold 22px "Georgia", serif';
        const keyWidth = context.measureText(hintKey).width;
        context.font = originalFont; // Reset font
        const text2Width = context.measureText(hintText2).width;
        const totalWidth = text1Width + keyWidth + text2Width;
        
        let currentX = hintX - (totalWidth / 2);
        
        context.textAlign = 'left'; // Switch to left align for sequential drawing

        // Draw "Press "
        context.fillStyle = '#f0e6d2';
        context.fillText(hintText1, currentX, hintY);
        currentX += text1Width;

        // Draw "E" in red and bold
        context.fillStyle = '#ff4d4d'; // Bright red
        context.font = 'bold 22px "Georgia", serif';
        context.fillText(hintKey, currentX, hintY);
        currentX += keyWidth;
        
        // Draw " to Open"
        context.fillStyle = '#f0e6d2';
        context.font = '22px "Georgia", serif'; // Ensure font is reset
        context.fillText(hintText2, currentX, hintY);

        context.restore();
    }


    /**
     * Draws the chest and any active visual effects.
     * @param {CanvasRenderingContext2D} context - The drawing context.
     */
    draw(context) {
        if (!this.animationManager.isLoaded) {
             context.fillStyle = 'rgba(255, 215, 0, 0.5)';
             context.fillRect(this.x, this.y, this.width, this.height);
             return;
        }
        // Draw the chest itself first
        this.animationManager.draw(context, this.x, this.y, this.width, this.height);
        
        // Draw the hint on top if the player is in range
        if (this.isPlayerInRange) {
            this.drawHint(context);
        }

        // Then draw the sparkles on top
        this.sparkles.forEach(sparkle => sparkle.draw(context));
    }
}