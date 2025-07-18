/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { ENVIRONMENT_DATA } from './EnvironmentData.js';
import { BlinkingEyes } from './BlinkingEyes.js';

/**
 * Manages loading and drawing all environment assets, including backgrounds and tile-based terrain.
 */
export class Environment {
    constructor(game, gameWidth, gameHeight, worldWidth) {
        this.game = game;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.worldWidth = worldWidth;
        this.assets = {}; // To store loaded image objects
        this.isLoaded = false;
        this.groundLevel = 0; // The Y-coordinate of the top of the ground tiles
        
        // Layout for platforms
        this.platformLayout = [
            // First Half
            { x: 750,  y: 350, tiles: 1 },
            { x: 1600, y: 250, tiles: 1 },
            { x: 2600, y: 200, tiles: 1 },
            // Second Half (duplciated and offset)
            { x: 750 + 3000,  y: 350, tiles: 1 },
            { x: 1600 + 3000, y: 250, tiles: 1 },
            { x: 2600 + 3000, y: 200, tiles: 1 },
        ];
        this.platforms = []; // To store calculated platform dimensions

        // Layout for static decorations
        this.decorationsLayout = [
            // First Half
            { assetKey: 'tree', x: 220, scale: 1.0},
            { assetKey: 'tombstones', index: 0, x: 550, scale: 0.45 },
            { assetKey: 'sign', index: 0, x: 850, scale: 0.3},
            { assetKey: 'bushes', index: 1, x: 980, scale: 0.5 },
            { assetKey: 'skeleton', x: 1250, scale: 0.3},
            { assetKey: 'deadBush', x: 1450, scale: 0.3 },
            { assetKey: 'crate', x: 1750, scale: 0.3 },
            { assetKey: 'tombstones', index: 1, x: 2000, scale: 0.45 },
            { assetKey: 'arrowSign', x: 2250, scale: 0.3 },
            { assetKey: 'bushes', index: 0, x: 2450, scale: 0.3 },
            { assetKey: 'tree', x: 2750, scale: 0.7 },
            // Second Half (duplicated and offset)
            { assetKey: 'tree', x: 220 + 3000, scale: 1.0},
            { assetKey: 'tombstones', index: 2, x: 550 + 3000, scale: 0.45 },
            { assetKey: 'sign', index: 0, x: 850 + 3000, scale: 0.3},
            { assetKey: 'bushes', index: 1, x: 980 + 3000, scale: 0.5 },
            { assetKey: 'skeleton', x: 1250 + 3000, scale: 0.3},
            { assetKey: 'deadBush', x: 1450 + 3000, scale: 0.3 },
            { assetKey: 'crate', x: 1750 + 3000, scale: 0.3 },
           // { assetKey: 'tombstones', index: 1, x: 2000 + 3000, scale: 0.45 },
            { assetKey: 'arrowSign', x: 2250 + 3000, scale: 0.3 },
            { assetKey: 'bushes', index: 0, x: 2450 + 3000, scale: 0.3 },
            { assetKey: 'tree', x: 2750 + 3000, scale: 0.7 },
        ];

        this.blinkingEyes = []; // Array to hold the eye instances
    }

    /**
     * Updates all dynamic elements within the environment, like blinking eyes.
     * @param {number} deltaTime Time since the last frame.
     */
    update(deltaTime) {
        this.blinkingEyes.forEach(eyes => eyes.update(deltaTime));
    }


    /**
     * Preloads all images specified in EnvironmentData.js.
     * @returns {Promise<void>} A promise that resolves when all assets are loaded.
     */
    async loadAssets() {
        const promises = [];
        for (const key in ENVIRONMENT_DATA) {
            const urls = ENVIRONMENT_DATA[key];
            this.assets[key] = [];
            for (const url of urls) {
                const promise = new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        this.assets[key].push(img);
                        resolve();
                    };
                    img.onerror = () => reject(`Failed to load image: ${url}`);
                    img.src = url;
                });
                promises.push(promise);
            }
        }

        try {
            await Promise.all(promises);
            this.isLoaded = true;
            this.calculateDimensions();
            this.createBlinkingEyes(); // Create eyes after assets are loaded
            console.log("All environment assets preloaded successfully.");
        } catch (error) {
            console.error("Error preloading environment assets:", error);
            this.isLoaded = false;
        }
    }

    /**
     * Creates blinking eye effects within the bushes.
     */
    createBlinkingEyes() {
        this.decorationsLayout.forEach(deco => {
            if (deco.assetKey === 'bushes') {
                const image = this.assets.bushes?.[deco.index || 0];
                if (image) {
                    const scale = deco.scale || 1;
                    const bushWidth = image.width * scale;
                    const bushHeight = image.height * scale;
                    const bushY = this.groundLevel - bushHeight;

                    // Add one pair of eyes to each bush.
                    const eyeX = deco.x + (Math.random() * 0.4 + 0.3) * bushWidth; // Center-ish X
                    const eyeY = bushY + (Math.random() * 0.3 + 0.4) * bushHeight; // Center-ish Y
                    this.blinkingEyes.push(new BlinkingEyes(this.game, eyeX, eyeY));
                }
            }
        });
    }

    /**
     * Calculates the pixel dimensions and positions of all procedural elements like ground and platforms.
     */
    calculateDimensions() {
        // Position the ground to occupy roughly the bottom 12.5% of the screen.
        this.groundLevel = this.gameHeight * 0.875;

        // Calculate platform dimensions from the layout
        const [leftTile, midTile, rightTile] = this.assets.leviTiles || [];
        if (!leftTile || !midTile || !rightTile) return;

        const tileWidth = midTile.width;
        const tileHeight = midTile.height;

        this.platforms = []; // Clear and recalculate
        for (const layout of this.platformLayout) {
            const platformWidth = leftTile.width + (layout.tiles * tileWidth) + rightTile.width;
            this.platforms.push({
                x: layout.x,
                y: layout.y,
                width: platformWidth,
                height: tileHeight
            });
        }
    }

    /**
     * Draws the parallax background layer.
     * @param {CanvasRenderingContext2D} context The drawing context.
     * @param {Camera} camera The game camera.
     */
    drawBackground(context, camera) {
        if (!this.isLoaded) return;
        const bgImage = this.assets.background?.[0];
        if (bgImage) {
            const parallaxFactor = 0.03;
            const parallaxX = camera.x * parallaxFactor;
            const bgWidth = this.gameWidth;
            
            const startX = -(parallaxX % bgWidth);

            context.drawImage(bgImage, startX, 0, bgWidth, this.gameHeight);
            context.drawImage(bgImage, startX + bgWidth, 0, bgWidth, this.gameHeight);

            // --- Add Moon Glow Effect ---
            const moonX = 450;
            const moonY = 100;
            const moonRadius = 60;
            
            context.save();
            context.shadowColor = 'rgba(255, 255, 220, 0.7)';
            context.shadowBlur = 40;
            context.fillStyle = 'rgba(255, 255, 220, 0.1)';
            context.beginPath();
            context.arc(startX + moonX, moonY, moonRadius, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.arc(startX + bgWidth + moonX, moonY, moonRadius, 0, Math.PI * 2);
            context.fill();
            context.restore();

            // --- Add Fog Effect ---
            const fogGradient = context.createLinearGradient(0, this.gameHeight, 0, this.gameHeight - 350);
            fogGradient.addColorStop(0, 'rgba(26, 26, 26, 0.8)');
            fogGradient.addColorStop(1, 'rgba(26, 26, 26, 0)');
            
            context.fillStyle = fogGradient;
            context.fillRect(0, 0, this.gameWidth, this.gameHeight);
        }
    }

    /**
     * Draws the main foreground environment (ground, platforms, decorations).
     * @param {CanvasRenderingContext2D} context The drawing context.
     * @param {Camera} camera The game camera for culling.
     */
    drawForeground(context, camera) {
        if (!this.isLoaded) return;
        
        const cameraLeft = camera.x;
        const cameraRight = camera.x + this.gameWidth;

        // Draw the ground tiles
        this.drawTiledSurface(context, this.assets.groundTiles, 0, this.worldWidth, this.groundLevel, camera);

        // Draw the platforms
        const leviTiles = this.assets.leviTiles;
        if (leviTiles) {
            for (const platform of this.platforms) {
                if (platform.x + platform.width >= cameraLeft && platform.x <= cameraRight) {
                    this.drawTiledSurface(context, leviTiles, platform.x, platform.width, platform.y, camera);
                }
            }
        }
        
        // Draw Decorations
        for(const decoration of this.decorationsLayout) {
            const assetKey = decoration.assetKey;
            const assetIndex = decoration.index || 0;
            const image = this.assets[assetKey]?.[assetIndex];
            const scale = decoration.scale || 1;

            if (image) {
                const scaledWidth = image.width * scale;
                const scaledHeight = image.height * scale;

                if (decoration.x + scaledWidth >= cameraLeft && decoration.x <= cameraRight) {
                    const yPos = this.groundLevel - scaledHeight; // Place on top of the ground, accounting for scale
                    context.drawImage(image, decoration.x, yPos, scaledWidth, scaledHeight);
                }
            }
        }

        // Draw the blinking eyes
        this.blinkingEyes.forEach(eyes => {
            // Cull eyes that are off-screen
            if (eyes.x > cameraLeft && eyes.x < cameraRight) {
                eyes.draw(context);
            }
        });
    }

    /**
     * A helper function to draw a seamless surface.
     * @param {CanvasRenderingContext2D} context The drawing context.
     * @param {Image[]} tiles The array of tiles [left, middle, right].
     * @param {number} x The starting x-coordinate of the surface.
     * @param {number} width The total width of the surface.
     * @param {number} y The y-coordinate of the surface.
     * @param {Camera} camera The game camera for culling.
     */
    drawTiledSurface(context, tiles, x, width, y, camera) {
        const [leftTile, midTile, rightTile] = tiles;
        if (!leftTile || !midTile || !rightTile) return;

        const tileWidth = midTile.width;
        
        const cameraLeft = camera.x;
        const cameraRight = camera.x + this.gameWidth;

        if (x + leftTile.width > cameraLeft && x < cameraRight) {
            context.drawImage(leftTile, x, y);
        }

        let currentX = x + leftTile.width;
        const endX = x + width - rightTile.width;
        while (currentX < endX) {
            if (currentX + tileWidth > cameraLeft && currentX < cameraRight) {
                context.drawImage(midTile, currentX, y);
            }
            currentX += tileWidth;
            if (currentX > cameraRight) break; // Optimization
        }

        if (endX + rightTile.width > cameraLeft && endX < cameraRight) {
            context.drawImage(rightTile, endX, y);
        }
    }
}