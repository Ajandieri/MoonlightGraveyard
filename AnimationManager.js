/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Manages animations from individual image files. This class is designed to work with
 * a configuration object that defines various animation sequences by providing a list of image URLs.
 * It handles preloading images, and managing both looping and single-play animations.
 */
export class AnimationManager {
    /**
     * @param {object} entity - The game object instance this manager belongs to (e.g., Player, Enemy).
     * @param {Object.<string, {urls: string[], speed: number, loop: boolean}>} animationsConfig - An object defining animation states.
     * @param {string} characterType - A string to identify the character type (e.g., 'Player' or 'Enemy') to select the correct idle animation.
     */
    constructor(entity, animationsConfig, characterType = 'Player') {
        this.entity = entity;
        this.animations = {}; // Will store loaded images and config
        this.isLoaded = false;
        this.characterType = characterType;
        
        this.currentAnimationName = null;
        this.currentAnimation = null;
        this.currentFrame = 0;
        this.frameTimer = 0;

        this.preloadImages(animationsConfig);
        
        // Automatically set the initial animation to 'idle' if it exists.
        if (animationsConfig['idle']) {
            this.setAnimation('idle');
        } else if (animationsConfig['walk']) { // Fallback for enemies that might start walking
            this.setAnimation('walk');
        }
    }

    /**
     * Preloads all images specified in the configuration.
     * @param {Object} config - The animation configuration object.
     */
    preloadImages(config) {
        const promises = [];
        const animationNames = Object.keys(config);

        for (const name of animationNames) {
            const animData = config[name];
            if (!animData.urls || animData.urls.length === 0) continue;

            this.animations[name] = {
                ...animData,
                images: [],
                frames: animData.urls.length
            };

            for (const url of animData.urls) {
                const promise = new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.animations[name].images.push(img);
                        resolve();
                    };
                    img.onerror = () => reject(`Failed to load image: ${url}`);
                    img.src = url;
                });
                promises.push(promise);
            }
        }
        
        if (promises.length === 0) {
            this.isLoaded = true;
            return;
        }

        Promise.all(promises)
            .then(() => {
                this.isLoaded = true;
                console.log(`All ${this.characterType} animation images preloaded successfully.`);
            })
            .catch(error => {
                console.error(`Error preloading ${this.characterType} animation images:`, error);
            });
    }

    /**
     * Sets the current animation state.
     * @param {string} name - The name of the animation to play.
     */
    setAnimation(name) {
        if (this.animations[name] && this.currentAnimationName !== name) {
            this.currentAnimationName = name;
            this.currentAnimation = this.animations[name];
            this.currentFrame = 0;
            this.frameTimer = 0;
        }
    }

    PlayerIdleAnim() { this.setAnimation('idle'); }
    PlayerRunAnim() { this.setAnimation('run'); }
    PlayerJumpAnim() { this.setAnimation('jump'); }
    PlayerShootAnim() { this.setAnimation('shoot'); }
    PlayerMeleeAnim() { this.setAnimation('melee'); }

    EnemyIdleAnim() { this.setAnimation('idle'); }
    EnemyWalkAnim() { this.setAnimation('walk'); }
    EnemyAttackAnim() { this.setAnimation('attack'); }
    EnemyDeadAnim() { this.setAnimation('dead'); }

    /**
     * Updates the animation frame based on the elapsed time.
     * @param {number} deltaTime - Time since the last frame in milliseconds.
     */
    update(deltaTime) {
        if (!this.currentAnimation || !this.isLoaded) return;

        this.frameTimer += deltaTime;
        if (this.frameTimer > this.currentAnimation.speed) {
            this.frameTimer = 0;
            const isLastFrame = this.currentFrame >= this.currentAnimation.frames - 1;

            if (this.currentAnimation.loop) {
                this.currentFrame = (this.currentFrame + 1) % this.currentAnimation.frames;
            } else if (!isLastFrame) {
                this.currentFrame++;
            } else {
                // Special case for 'dead' animation: hold the last frame.
                if (this.currentAnimationName === 'dead') {
                    return; // Stop updating, holding the last frame
                }

                // For other non-looping animations, revert based on type.
                if (this.characterType === 'Player') {
                    // Check if the player entity exists and if it's in the air.
                    if (this.entity && typeof this.entity.isOnGround === 'function' && !this.entity.isOnGround()) {
                        this.PlayerJumpAnim(); // Revert to jump animation if in the air
                    } else {
                        this.PlayerIdleAnim(); // Revert to idle if on the ground
                    }
                } else if (this.characterType === 'Enemy') {
                    this.EnemyIdleAnim();
                }
                // For other types (like TreasureChest), we do nothing.
                // The owning entity is responsible for state transition after a non-looping animation.
            }
        }
    }

    /**
     * Draws the current animation frame to the canvas.
     * @param {CanvasRenderingContext2D} context - The drawing context.
     * @param {number} x - The x-coordinate to draw the sprite at.
     * @param {number} y - The y-coordinate to draw the sprite at.
     * @param {number} width - The destination width of the drawn sprite.
     * @param {number} height - The destination height of the drawn sprite.
     */
    draw(context, x, y, width, height) {
        if (!this.isLoaded || !this.currentAnimation || this.currentAnimation.images.length === 0) return;

        const imageToDraw = this.currentAnimation.images[this.currentFrame];

        if (imageToDraw) {
            const destWidth = width || imageToDraw.naturalWidth;
            const destHeight = height || imageToDraw.naturalHeight;
            context.drawImage(imageToDraw, x, y, destWidth, destHeight);
        }
    }
}