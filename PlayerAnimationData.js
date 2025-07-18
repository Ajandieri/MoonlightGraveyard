/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =================================================================
// == PLAYER ANIMATION CONFIGURATION ==
// =================================================================
// IMPORTANT: This is where you add the URLs for your player's animation sprites.
// Simply add the path to each image file in the correct 'urls' array.
export const PLAYER_ANIMATIONS = {
    'idle': { 
        urls: [
            // e.g., '/assets/player/idle_01.png', '/assets/player/idle_02.png', ...
            'https://i.postimg.cc/TpBgnKRr/Idle-1.png',
            'https://i.postimg.cc/BXj28TGS/Idle-2.png',
            'https://i.postimg.cc/GBwPnHVc/Idle-3.png',
            'https://i.postimg.cc/XZffjn69/Idle-4.png',
            'https://i.postimg.cc/dkJ8DgJp/Idle-5.png',
            'https://i.postimg.cc/fSLmfXtv/Idle-6.png',
            'https://i.postimg.cc/hzMVmMjj/Idle-7.png',
            'https://i.postimg.cc/Z0K8mk7y/Idle-8.png',
            'https://i.postimg.cc/7LbK7zNT/Idle-3.png',
            'https://i.postimg.cc/RqscVPyp/Idle-10.png',            
        ], 
        speed: 200, 
        loop: true 
    },
    'run': { 
        urls: [
            // e.g., '/assets/player/run_01.png', '/assets/player/run_02.png', ...
            'https://i.postimg.cc/ppCpkyY9/Run-1.png',
            'https://i.postimg.cc/dhSDPXfw/Run-2.png',
            'https://i.postimg.cc/CZB5F7yD/Run-3.png',
            'https://i.postimg.cc/2qs63Wmt/Run-4.png',
            'https://i.postimg.cc/kRFD0g0p/Run-5.png',
            'https://i.postimg.cc/s1pBQTM4/Run-6.png',
            'https://i.postimg.cc/jLtDzyN0/Run-7.png',
            'https://i.postimg.cc/0zNr4xcV/Run-8.png',
        ], 
        speed: 100, 
        loop: true 
    },
    'jump': { 
        urls: [
            // e.g., '/assets/player/jump_01.png', '/assets/player/jump_02.png', ...
            'https://i.postimg.cc/TLXJXpyV/Jump-1.png',
            'https://i.postimg.cc/BLccZ4Dd/Jump-2.png',
            'https://i.postimg.cc/fkDf2SQZ/Jump-3.png',
            'https://i.postimg.cc/ZWB8BrpP/Jump-4.png',
            'https://i.postimg.cc/y3sgLRDG/Jump-5.png',
            'https://i.postimg.cc/5jSnbqS6/Jump-6.png',
            'https://i.postimg.cc/NK548hqH/Jump-7.png',
            'https://i.postimg.cc/crDh8xjW/Jump-8.png',
            'https://i.postimg.cc/gxQKNMmB/Jump-9.png',
            'https://i.postimg.cc/xNfGch3q/Jump-10.png',
        ], 
        speed: 80, 
        loop: false 
    },
    'shoot': {
        urls: [
            // e.g., '/assets/player/shoot_01.png', ...
            'https://i.postimg.cc/94SF47P9/Shoot-1.png',
            'https://i.postimg.cc/ygZ608nb/Shoot-2.png',
            'https://i.postimg.cc/WDt1bnZj/Shoot-3.png'
        ],
        speed: 100,
        loop: false
    },
    'melee': {
        urls: [
            // e.g., '/assets/player/melee_01.png', ...
            'https://i.postimg.cc/2qxMMRyS/Melee-1.png',
            'https://i.postimg.cc/tZSfR3h0/Melee-2.png',
            'https://i.postimg.cc/YLvPvv3v/Melee-3.png',
            'https://i.postimg.cc/WtyKQ7Ng/Melee-4.png',
            'https://i.postimg.cc/CRkWCfVD/Melee-5.png',
            'https://i.postimg.cc/3yhztJKq/Melee-6.png',
            'https://i.postimg.cc/34JVHS0C/Melee-7.png',
        ],
        speed: 90,
        loop: false
    }
};