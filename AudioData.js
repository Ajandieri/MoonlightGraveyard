

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =================================================================
// == AUDIO ASSET CONFIGURATION ==
// =================================================================
// This file centralizes all URLs for the game's audio assets.

export const AUDIO_DATA = {
    // Looping background music
    backgroundMusic: 'Audio/BackMusic.mp3',

    // Player sound effects (provide arrays for random selection)
    pistolShoot: [
        'Audio/Pistol1.mp3'
    ],
    melee: [
        'Audio/Melee1.mp3',
        'Audio/Melee2.mp3',
        'Audio/Melee3.mp3',
        'Audio/Melee5.mp3',
        'Audio/Melee8.mp3'
    ],
    jump: [
        'Audio/GirlJump1.mp3',
        'Audio/GirlJump2.mp3',
    ],
    footsteps: [
        'Audio/GirlFootSteps.mp3',
    ],

    // Enemy sound effects (provide arrays for random selection)
    enemyHit: [
        'Audio/EnemyTakeDamage.mp3',
    ],
    enemyDeath: [
        'Audio/Death1.mp3',
        'Audio/Death2.mp3',
    ],
    
    // Object sound effects
    chestOpen: 'Audio/ChestOpens.mp3',

    // Ambient background screams
    scream: [
        'Audio/Scream1.mp3',
        'Audio/Scream2.mp3',
        'Audio/Scream3.mp3'
    ],

    // Sound effect for when player presses A and D at the same time
    WhereToGo: 'Audio/WhereToGo.mp3'
};