

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AnimationManager } from './AnimationManager.js';
import { PLAYER_ANIMATIONS } from './PlayerAnimationData.js';
import { PlayerController } from './PlayerController.js';
import { Environment } from './Environment.js';
import { Camera } from './Camera.js';
import { Enemy } from './Enemy.js';
import { Particle } from './Particle.js';
import { Bullet } from './Bullet.js';
import { TreasureChest } from './TreasureChest.js';
import { SmokeParticle } from './SmokeParticle.js';
import { DustParticle } from './DustParticle.js';
import { FootstepParticle } from './FootstepParticle.js';
import { ResumeScroll } from './ResumeScroll.js';
import { RESUME_SCROLL_DATA } from './ResumeScrollData.js';
import { AudioManager } from './AudioManager.js';
import { AUDIO_DATA } from './AudioData.js';
import { Player } from './Player.js';
import { DIALOGUE_DATA } from './DialogueData.js';

/**
 * The main game class to orchestrate everything.
 */
class Game {
    constructor(canvas, startMenu, startButton, controlsGuide) {
        this.canvas = canvas;
        this.startMenu = startMenu;
        this.startButton = startButton;
        this.controlsGuide = controlsGuide;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = canvas.getContext('2d');
        this.lastTime = 0;
        
        this.worldWidth = this.width * 6; // Game world is 6x wider than the screen
        this.camera = null;

        this.environment = null;
        this.player = null;
        this.playerController = null;
        this.audioManager = null;
        this.enemies = [];
        this.particles = [];
        this.smokeParticles = [];
        this.dustParticles = [];
        this.footstepParticles = [];
        this.bullets = [];
        this.treasureChests = [];
        this.resumeScrolls = [];
        this.assets = {};

        // --- Game State & Dialogue ---
        this.gameState = 'MENU'; // 'MENU', 'DIALOGUE', 'PLAYING', 'GAME_OVER'
        this.selectedLanguage = 'en'; // 'en' or 'ka', defaults to English
        this.dialogueQueue = [];
        this.currentDialogue = null;
        this.dialogueTypingSpeed = 50; // ms per character
        this.startButtonTexts = {
            en: 'Start Game',
            ka: 'თამაშის დაწყება'
        };
        this.controlsGuideTexts = {
            en: `<div class="controls-title">Controls</div>` +
                `<div class="control-item"><span>Move Right</span><span class="key">D</span></div>` +
                `<div class="control-item"><span>Move Left</span><span class="key">A</span></div>` +
                `<div class="control-item"><span>Jump</span><span class="key">SPACE</span></div>` +
                `<div class="control-item"><span>Fire</span><span class="key">Q</span></div>` +
                `<div class="control-item"><span>Knife</span><span class="key">W</span></div>`,
            ka: `<div class="controls-title">კონტროლი</div>` +
                `<div class="control-item"><span>სირბილი მარჯვნივ</span><span class="key">D</span></div>` +
                `<div class="control-item"><span>სირბილი მარცხნივ</span><span class="key">A</span></div>` +
                `<div class="control-item"><span>ახტომა</span><span class="key">SPACE</span></div>` +
                `<div class="control-item"><span>სროლა</span><span class="key">Q</span></div>` +
                `<div class="control-item"><span>დანა</span><span class="key">W</span></div>`
        };
        
        this.animate = this.animate.bind(this);
    }

    /**
     * A utility function to preload a single image.
     * @param {string} url The URL of the image to load.
     * @returns {Promise<Image>} A promise that resolves with the loaded Image object.
     */
    async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(`Failed to load image: ${url}`);
            img.src = url;
        });
    }
    
    /**
     * Initializes the game by loading assets and setting up game objects.
     */
    async init() {
        this.camera = new Camera(this.width, this.height, this.worldWidth);
        this.environment = new Environment(this, this.width, this.height, this.worldWidth);
        this.audioManager = new AudioManager(AUDIO_DATA);

        // Preload all critical visual assets before starting
        try {
            await this.environment.loadAssets();
            this.assets.resumeScroll = await this.loadImage(RESUME_SCROLL_DATA.url);
            console.log("All critical visual assets have been preloaded.");
        } catch (error) {
            console.error("A critical asset failed to load, cannot start the game.", error);
            this.startButton.textContent = 'Load Error';
            this.startButton.disabled = true;
            return; // Halt initialization
        }

        // Create game objects and pass the audio manager
        this.player = new Player(this, PLAYER_ANIMATIONS, this.environment, this.audioManager);
        
        // Create enemies
        this.enemies.push(new Enemy(this, 1200, 0, this.environment, this.audioManager));
        this.enemies.push(new Enemy(this, 1800, 0, this.environment, this.audioManager));
        this.enemies.push(new Enemy(this, 2700, 0, this.environment, this.audioManager));
        this.enemies.push(new Enemy(this, 900 + 3000, 0, this.environment, this.audioManager));
        this.enemies.push(new Enemy(this, 1800 + 3000, 0, this.environment, this.audioManager));
        this.enemies.push(new Enemy(this, 2700 + 3000, 0, this.environment, this.audioManager));
        
        // Create treasure chest
        this.treasureChests.push(new TreasureChest(this, 5500, this.audioManager));

        // The game loop will start in a "paused" drawing state
        this.animate(0);

        // --- Setup UI Event Listeners ---
        this.setupLanguageSelector();
        this.setupStartButton();
    }

    /**
     * Sets up the language selection functionality.
     */
    setupLanguageSelector() {
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                languageOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedLanguage = option.dataset.lang;
                // Update button text based on the new language
                this.startButton.textContent = this.startButtonTexts[this.selectedLanguage];
            });
        });
    }

    /**
     * Sets up the start button to load audio and begin the game.
     */
    setupStartButton() {
        this.startButton.addEventListener('click', async () => {
            this.startButton.disabled = true;
            this.startButton.textContent = 'Loading...';

            // User has interacted, so we can create the audio context
            this.audioManager.initAudioContext();
            
            // Now load all sounds
            await this.audioManager.loadSounds();

            // Fade out menu and start the game
            this.startMenu.style.opacity = '0';
            this.audioManager.playBackgroundMusic();
            this.audioManager.startRandomScreams(); // Start the spooky screams
            this.showControlsGuide();

            setTimeout(() => {
                this.startMenu.classList.add('hidden');
                this.startDialogue([
                    { text: DIALOGUE_DATA[this.selectedLanguage].intro, target: this.player }
                ]);
                this.playerController = new PlayerController(this.player);
            }, 500);
        });
    }

    /**
     * Shows the controls guide UI element with a fade-in animation.
     */
    showControlsGuide() {
        if (!this.controlsGuide) return;
        
        const text = this.controlsGuideTexts[this.selectedLanguage];
        this.controlsGuide.innerHTML = text;
        this.controlsGuide.classList.remove('hidden'); // This removes display: none

        // Add 'visible' class after a short delay to trigger the transition
        // This forces a reflow, allowing the transition to play.
        setTimeout(() => {
            this.controlsGuide.classList.add('visible');
        }, 10);
    }

    /**
     * Creates a more intense puff of smoke particles.
     * @param {number} x The center x-coordinate for the effect.
     * @param {number} y The center y-coordinate for the effect.
     */
    createSmokeEffect(x, y) {
        const particleCount = 70; // Increased for a more intense effect
        for (let i = 0; i < particleCount; i++) {
            this.smokeParticles.push(new SmokeParticle(this, x, y));
        }
    }

    /**
     * Creates a dust cloud effect for sliding.
     * @param {number} x The center x-coordinate for the effect.
     * @param {number} y The center y-coordinate for the effect.
     * @param {string} direction The direction the player is facing.
     */
    createDustEffect(x, y, direction) {
        const particleCount = 3; // A small puff
        for (let i = 0; i < particleCount; i++) {
            this.dustParticles.push(new DustParticle(this, x, y, direction));
        }
    }

    /**
     * Creates a dust cloud effect for footsteps or landing.
     * @param {number} x The center x-coordinate for the effect.
     * @param {number} y The center y-coordinate for the effect.
     * @param {number} count The number of particles to create.
     * @param {string|null} direction Optional direction for running, or null for a burst effect on landing.
     */
    createFootstepEffect(x, y, count, direction = null) {
        const particleCount = count;
        for (let i = 0; i < particleCount; i++) {
            this.footstepParticles.push(new FootstepParticle(this, x, y, direction));
        }
    }


    /**
     * Creates a new ResumeScroll object and adds it to the game.
     * @param {number} chestX The x-coordinate of the chest that spawned it.
     * @param {number} chestY The y-coordinate of the chest that spawned it.
     */
    spawnResumeScroll(chestX, chestY) {
        this.resumeScrolls.push(new ResumeScroll(this, chestX, chestY));
    }

    /**
     * Starts a new dialogue sequence.
     * @param {Array<Object>} sequence - An array of dialogue objects.
     */
    startDialogue(sequence) {
        this.dialogueQueue = sequence;
        // Don't change the game state if it's already GAME_OVER.
        // Dialogue can play on top of the GAME_OVER state.
        if (this.gameState !== 'GAME_OVER') {
            this.gameState = 'DIALOGUE';
        }
        this.advanceDialogueQueue();
    }
    
    /**
     * Moves to the next dialogue in the queue.
     */
    advanceDialogueQueue() {
        if (this.dialogueQueue.length > 0) {
            this.currentDialogue = this.dialogueQueue.shift();
            this.currentDialogue.displayedText = '';
            this.currentDialogue.typingTimer = 0;
            this.currentDialogue.isTypingComplete = false;
            this.currentDialogue.endTimer = 0;
        } else {
            this.currentDialogue = null;
            if (this.gameState !== 'GAME_OVER') {
                 this.gameState = 'PLAYING';
            }
        }
    }
    
    /**
     * Updates the current dialogue's typing effect and timers.
     * @param {number} deltaTime - Time since the last frame.
     */
    updateDialogue(deltaTime) {
        if (!this.currentDialogue) {
            return;
        }
        
        const dialogue = this.currentDialogue;
        if (!dialogue.isTypingComplete) {
            dialogue.typingTimer += deltaTime;
            if (dialogue.typingTimer >= this.dialogueTypingSpeed) {
                dialogue.typingTimer = 0;
                if (dialogue.displayedText.length < dialogue.text.length) {
                    dialogue.displayedText += dialogue.text[dialogue.displayedText.length];
                } else {
                    dialogue.isTypingComplete = true;
                }
            }
        } else {
            dialogue.endTimer += deltaTime;
            if (dialogue.endTimer >= 2000) { // Wait 2s after typing
                this.advanceDialogueQueue();
            }
        }
    }
    
    /**
     * Called when the chest is opened. Freezes the player and detaches controls.
     */
    freezePlayerForEnd() {
        if (this.player) {
            this.player.forceIdleAndFreeze();
        }
        if (this.playerController) {
            this.playerController.detach();
        }
    }
    
    /**
     * Initiates the end-of-game sequence: dialogue, download, and disabling controls.
     */
    endGameSequence() {
        // Add a guard to ensure this sequence only runs once.
        if (this.gameState === 'GAME_OVER') {
            return;
        }
        
        this.gameState = 'GAME_OVER';
        
        this.startDialogue([{
            text: DIALOGUE_DATA[this.selectedLanguage].outro,
            target: this.player,
        }]);

        // Trigger the file download after a specified delay
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = RESUME_SCROLL_DATA.downloadUrl;
            link.download = 'AndriaJandieri_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, RESUME_SCROLL_DATA.downloadDelay || 500); // Use delay, with a fallback
    }

    /**
     * Updates all game objects based on the current game state.
     * @param {number} deltaTime - Time since the last frame.
     */
    update(deltaTime) {
        // Handle dialogue updates separately, as they can occur in PLAYING or GAME_OVER states.
        if (this.gameState === 'DIALOGUE' || this.gameState === 'GAME_OVER') {
            this.updateDialogue(deltaTime);
        }

        // --- Core Updates (animations, physics) ---
        // These run in both PLAYING and GAME_OVER to keep the world alive.
        // The individual update methods have checks to prevent movement when game is over.
        if (this.gameState === 'PLAYING' || this.gameState === 'GAME_OVER') {
            if (this.player) this.player.update(deltaTime);
            this.enemies.forEach(enemy => enemy.update(deltaTime));
            this.treasureChests.forEach(chest => chest.update(deltaTime));
            this.resumeScrolls.forEach(scroll => scroll.update(deltaTime));
            this.particles.forEach(p => p.update(deltaTime));
            this.smokeParticles.forEach(p => p.update(deltaTime));
            this.dustParticles.forEach(p => p.update(deltaTime));
            this.footstepParticles.forEach(p => p.update(deltaTime));
            this.bullets.forEach(bullet => bullet.update(deltaTime));
            if (this.environment) {
                this.environment.update(deltaTime);
            }

            // Cleanup arrays
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.particles = this.particles.filter(p => !p.markedForDeletion);
            this.smokeParticles = this.smokeParticles.filter(p => !p.markedForDeletion);
            this.dustParticles = this.dustParticles.filter(p => !p.markedForDeletion);
            this.footstepParticles = this.footstepParticles.filter(p => !p.markedForDeletion);
            this.bullets = this.bullets.filter(bullet => !bullet.markedForDeletion);
        }

        // --- Active Gameplay Logic ---
        // This block only runs when the player has active control.
        if (this.gameState === 'PLAYING') {
            if (!this.player || !this.playerController || !this.environment || !this.camera) {
                return;
            }
            
            // Prevent player control if the player is frozen for the end sequence.
            if (!this.player.isFrozen) {
                this.playerController.update(deltaTime);
            }

            // Check if the scroll has finished its animation to trigger the end game
            this.resumeScrolls.forEach(scroll => {
                if (scroll.awaitingDialogueTrigger) {
                    this.endGameSequence();
                    scroll.awaitingDialogueTrigger = false; // Prevent re-triggering
                }
            });

            // Handle chest opening with 'E' key
            if (this.playerController.inputHandler.keys.has('e')) {
                this.treasureChests.forEach(chest => {
                    // Player must be in range and on the ground to open.
                    if (chest.state === 'closed' && chest.isPlayerInRange && this.player.isOnGround()) {
                        chest.open();
                    }
                });
            }

            // Handle bullet firing
            if (this.player.animationManager.currentAnimationName === 'shoot' && 
                this.player.animationManager.currentFrame === 1 && 
                !this.player.hasFiredThisShot) 
            {
                const bulletYOffset = this.player.height * 0.55;
                const bulletXOffset = this.player.direction === 'right' ? this.player.width - 10 : -10;
                this.bullets.push(new Bullet(this, this.player.x + bulletXOffset, this.player.y + bulletYOffset - 5, this.player.direction));
                this.player.hasFiredThisShot = true;
            }

            // Handle melee attack collisions
            if (this.player.animationManager.currentAnimationName === 'melee') {
                const attackRange = 80;
                const attackHitbox = {
                    x: this.player.direction === 'right' ? this.player.x + this.player.hitboxOffsetX + this.player.hitboxWidth - 10 : this.player.x + this.player.hitboxOffsetX + 10 - attackRange,
                    y: this.player.y,
                    width: attackRange,
                    height: this.player.height
                };

                this.enemies.forEach(enemy => {
                    const enemyHitboxX = enemy.x + enemy.hitboxOffsetX;
                    if (!enemy.isDead && !this.player.enemiesHitThisSwing.includes(enemy)) {
                        if (
                            attackHitbox.x < enemyHitboxX + enemy.hitboxWidth &&
                            attackHitbox.x + attackHitbox.width > enemyHitboxX &&
                            attackHitbox.y < enemy.y + enemy.height &&
                            attackHitbox.y + attackHitbox.height > enemy.y
                        ) {
                            enemy.takeDamage(25);
                            this.player.enemiesHitThisSwing.push(enemy);
                            for (let i = 0; i < 15; i++) {
                                this.particles.push(new Particle(this, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                            }
                        }
                    }
                });
                
                // Handle scaring away blinking eyes
                this.environment.blinkingEyes.forEach(eye => {
                    if (!eye.isScared) {
                        // Define a "scare zone" around the eyes
                        const eyeScareZone = {
                            x: eye.x - 20, y: eye.y - 20,
                            width: 40, height: 40,
                        };
                        
                        // Check for overlap between the attack hitbox and the scare zone
                        if (
                            attackHitbox.x < eyeScareZone.x + eyeScareZone.width &&
                            attackHitbox.x + attackHitbox.width > eyeScareZone.x &&
                            attackHitbox.y < eyeScareZone.y + eyeScareZone.height &&
                            attackHitbox.y + attackHitbox.height > eyeScareZone.y
                        ) {
                            eye.scareAway();
                        }
                    }
                });
            }
            
            // Handle bullet collisions
            this.bullets.forEach(bullet => {
                // Check collision with enemies
                this.enemies.forEach(enemy => {
                    const enemyHitboxX = enemy.x + enemy.hitboxOffsetX;
                    if (!enemy.isDead &&
                        bullet.x < enemyHitboxX + enemy.hitboxWidth &&
                        bullet.x + bullet.width > enemyHitboxX &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y
                    ) {
                        enemy.takeDamage(bullet.damage);
                        bullet.markedForDeletion = true;
                        for (let i = 0; i < 15; i++) {
                            this.particles.push(new Particle(this, bullet.x, bullet.y + bullet.height / 2));
                        }
                    }
                });

                // Check collision with blinking eyes
                this.environment.blinkingEyes.forEach(eye => {
                    if (!eye.isScared && !bullet.markedForDeletion) {
                        const eyeScareZone = {
                            x: eye.x - 20, y: eye.y - 20,
                            width: 40, height: 40,
                        };
                        
                        // Check for overlap between the bullet and the scare zone
                        if (
                            bullet.x < eyeScareZone.x + eyeScareZone.width &&
                            bullet.x + bullet.width > eyeScareZone.x &&
                            bullet.y < eyeScareZone.y + eyeScareZone.height &&
                            bullet.y + bullet.height > eyeScareZone.y
                        ) {
                            eye.scareAway();
                            // Do not mark the bullet for deletion; let it pass through.
                        }
                    }
                });
            });
        }

        if (this.camera && this.player) {
            this.camera.update(this.player);
        }
    }

    /**
     * Draws all game objects and UI elements like the dialogue box.
     */
    draw() {
        this.context.clearRect(0, 0, this.width, this.height);
        
        if (this.environment) {
            this.environment.drawBackground(this.context, this.camera);
        }
        
        this.context.save();
        this.context.translate(-this.camera.x, -this.camera.y);

        if (this.environment) {
            this.environment.drawForeground(this.context, this.camera);
        }
        
        this.treasureChests.forEach(chest => chest.draw(this.context));
        this.resumeScrolls.forEach(scroll => scroll.draw(this.context));
        this.enemies.forEach(enemy => enemy.draw(this.context));
        this.particles.forEach(p => p.draw(this.context));
        this.smokeParticles.forEach(p => p.draw(this.context));
        this.dustParticles.forEach(p => p.draw(this.context));
        this.footstepParticles.forEach(p => p.draw(this.context));
        this.bullets.forEach(bullet => bullet.draw(this.context));
        
        if (this.player) {
            this.player.draw(this.context);
        }
        
        this.context.restore();

        if ((this.gameState === 'DIALOGUE' || this.gameState === 'GAME_OVER') && this.currentDialogue) {
            this.drawDialogueBox();
        }
    }

    /**
     * Draws a stylish dialogue box as a speech bubble above the target character's head.
     */
    drawDialogueBox() {
        const dialogue = this.currentDialogue;
        if (!dialogue || !dialogue.target) {
            return;
        }
        
        const target = dialogue.target;
        const text = dialogue.displayedText;
        this.context.font = '20px "Georgia", serif';
        const textMetrics = this.context.measureText(text);
        
        const boxPadding = 20;
        const boxWidth = Math.min(this.width - 40, this.context.measureText(dialogue.text).width + boxPadding * 2);
        const boxHeight = 50;
        const borderRadius = 10;
        const calloutHeight = 15;
        const calloutWidth = 30;

        const targetScreenX = target.x - this.camera.x + target.width / 2;
        const targetScreenY = target.y - this.camera.y;

        let boxX = targetScreenX - boxWidth / 2;
        let boxY = targetScreenY - boxHeight - calloutHeight - 15;

        boxX = Math.max(20, Math.min(boxX, this.width - boxWidth - 20));
        boxY = Math.max(20, Math.min(boxY, this.height - boxHeight - 20));
        
        const calloutX = Math.max(
            boxX + borderRadius + calloutWidth / 2,
            Math.min(targetScreenX, boxX + boxWidth - borderRadius - calloutWidth / 2)
        );

        this.context.save();
        
        this.context.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.context.strokeStyle = 'rgba(122, 14, 14, 0.9)';
        this.context.shadowColor = 'rgba(255, 80, 80, 0.7)';
        this.context.shadowBlur = 15;
        this.context.lineWidth = 3;

        this.context.beginPath();
        this.context.moveTo(boxX + borderRadius, boxY);
        this.context.lineTo(boxX + boxWidth - borderRadius, boxY);
        this.context.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius, borderRadius);
        this.context.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius);
        this.context.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - borderRadius, boxY + boxHeight, borderRadius);
        this.context.lineTo(calloutX + calloutWidth / 2, boxY + boxHeight);
        this.context.lineTo(calloutX, boxY + boxHeight + calloutHeight);
        this.context.lineTo(calloutX - calloutWidth / 2, boxY + boxHeight);
        this.context.lineTo(boxX + borderRadius, boxY + boxHeight);
        this.context.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius, borderRadius);
        this.context.lineTo(boxX, boxY + borderRadius);
        this.context.arcTo(boxX, boxY, boxX + borderRadius, boxY, borderRadius);
        this.context.closePath();
        
        this.context.fill();
        this.context.stroke();
        
        this.context.restore();
        
        this.context.fillStyle = '#f0e6d2';
        this.context.font = '20px "Georgia", serif';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2);
    }
    
    /**
     * The main game loop.
     * @param {number} timestamp - The current time provided by requestAnimationFrame.
     */
    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime || 0);
        this.draw();
        
        requestAnimationFrame(this.animate);
    }
}

window.addEventListener('load', function() {
    const canvas = document.getElementById('game-canvas');
    const startMenu = document.getElementById('start-menu');
    const startButton = document.getElementById('start-button');
    const controlsGuide = document.getElementById('controls-guide');

    if (!canvas || !startMenu || !startButton || !controlsGuide) {
        console.error('Game elements not found!');
        return;
    }

    const game = new Game(canvas, startMenu, startButton, controlsGuide);
    game.init();
});