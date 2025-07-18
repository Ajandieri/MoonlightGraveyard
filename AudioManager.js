

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Manages loading and playback of all game audio using the Web Audio API.
 */
export class AudioManager {
    constructor(audioData) {
        this.audioData = audioData;
        this.audioContext = null;
        this.buffers = {};
        this.isLoaded = false;
        this.backgroundMusicSource = null;
        this.loopingSources = {}; // To manage stoppable, looping sounds
        this.screamTimeout = null; // To hold the timeout ID for random screams
    }

    /**
     * Initializes the AudioContext. This must be called after a user interaction.
     */
    initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log("AudioContext created successfully.");
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.", e);
            }
        }
    }

    /**
     * Loads all audio files defined in AudioData.js into AudioBuffers.
     * @returns {Promise<void>} A promise that resolves when all audio is loaded.
     */
    async loadSounds() {
        if (!this.audioContext) {
            console.warn("AudioContext not initialized. Cannot load sounds.");
            return;
        }

        const promises = [];
        for (const key in this.audioData) {
            const urls = Array.isArray(this.audioData[key]) ? this.audioData[key] : [this.audioData[key]];
            this.buffers[key] = [];
            
            for (const url of urls) {
                const promise = fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                        }
                        return response.arrayBuffer();
                    })
                    .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        this.buffers[key].push(audioBuffer);
                    })
                    .catch(error => {
                        console.error(`Failed to load or decode audio from ${url}:`, error);
                    });
                promises.push(promise);
            }
        }
        
        try {
            await Promise.all(promises);
            this.isLoaded = true;
            console.log("All audio assets loaded successfully.");
        } catch (error) {
            console.error("An error occurred while loading audio assets:", error);
        }
    }

    /**
     * Plays a sound effect.
     * @param {string} key - The key of the sound in AudioData (e.g., 'pistolShoot').
     * @param {boolean} [isRandom=false] - If true, plays a random sound from the array.
     */
    playSound(key, isRandom = false) {
        if (!this.isLoaded || !this.audioContext || !this.buffers[key] || this.buffers[key].length === 0) return;
        
        let buffer;
        if (isRandom) {
            const randomIndex = Math.floor(Math.random() * this.buffers[key].length);
            buffer = this.buffers[key][randomIndex];
        } else {
            buffer = this.buffers[key][0];
        }

        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        }
    }

    /**
     * Plays the background music on a loop.
     */
    playBackgroundMusic() {
        if (this.backgroundMusicSource) {
            this.backgroundMusicSource.stop();
        }
        
        if (!this.isLoaded || !this.audioContext || !this.buffers.backgroundMusic || this.buffers.backgroundMusic.length === 0) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers.backgroundMusic[0];
        source.loop = true;
        source.connect(this.audioContext.destination);
        source.start(0);

        this.backgroundMusicSource = source;
    }

    /**
     * Starts a looping sound effect.
     * @param {string} key The key of the sound to loop.
     */
    startLoopingSound(key) {
        if (this.loopingSources[key] || !this.isLoaded || !this.audioContext || !this.buffers[key]?.[0]) {
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers[key][0];
        source.loop = true;
        source.connect(this.audioContext.destination);
        source.start(0);
        
        this.loopingSources[key] = source;
    }

    /**
     * Stops a looping sound effect.
     * @param {string} key The key of the sound to stop.
     */
    stopLoopingSound(key) {
        if (this.loopingSources[key]) {
            this.loopingSources[key].stop();
            delete this.loopingSources[key];
        }
    }

    /**
     * Starts the loop of playing random background screams.
     */
    startRandomScreams() {
        if (!this.isLoaded || !this.audioContext || !this.buffers.scream?.length) {
            console.warn("Scream audio not loaded, cannot start random screams.");
            return;
        }
        this.scheduleNextScream();
    }

    /**
     * Stops the loop of random screams.
     */
    stopRandomScreams() {
        if (this.screamTimeout) {
            clearTimeout(this.screamTimeout);
            this.screamTimeout = null;
        }
    }
    
    /**
     * Schedules the next random scream to be played after a random delay.
     */
    scheduleNextScream() {
        this.stopRandomScreams(); // Clear existing timeout to prevent overlaps

        const minDelay = 5000; // 5 seconds
        const maxDelay = 10000; // 10 seconds
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;

        this.screamTimeout = setTimeout(() => {
            this.playSound('scream', true); // Play a random scream
            this.scheduleNextScream(); // Schedule the next one
        }, delay);
    }
}