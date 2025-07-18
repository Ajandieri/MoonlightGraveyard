/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =================================================================
// == ENEMY ANIMATION CONFIGURATION ==
// =================================================================
// IMPORTANT: This is where you add the URLs for your enemy's animation sprites.
// Simply add the path to each image file in the correct 'urls' array.
export const ENEMY_ANIMATIONS = {
    'idle': { 
        urls: [
            // e.g., '/assets/enemy/idle_01.png', ...
            'https://i.postimg.cc/m1fr72Vr/Idle-1.png',
            'https://i.postimg.cc/GTFmKwSx/Idle-2.png',
            'https://i.postimg.cc/nMBrpBc9/Idle-3.png',
            'https://i.postimg.cc/cKkgtSVK/Idle-4.png',
            'https://i.postimg.cc/r0ddSHkf/Idle-5.png',
            'https://i.postimg.cc/PpBCKMfT/Idle-6.png',
            'https://i.postimg.cc/PNwpJ0Kx/Idle-7.png',
            'https://i.postimg.cc/BPHXz1tD/Idle-8.png',
            'https://i.postimg.cc/jLYW7vkh/Idle-9.png',
            'https://i.postimg.cc/fJ7VjXGQ/Idle-10.png',
            'https://i.postimg.cc/MndXgwZs/Idle-11.png',
            'https://i.postimg.cc/21zVHyYb/Idle-12.png',
            'https://i.postimg.cc/B8bt0zXJ/Idle-13.png',
            'https://i.postimg.cc/v1KTHvVf/Idle-14.png',
            'https://i.postimg.cc/G8s2BsFN/Idle-15.png',
        ], 
        speed: 250, 
        loop: true 
    },
    'walk': { 
        urls: [
            // e.g., '/assets/enemy/walk_01.png', ...            
            'https://i.postimg.cc/230ZPnHd/Walk-1.png',
            'https://i.postimg.cc/zygHb6qp/Walk-2.png',
            'https://i.postimg.cc/hfhdghwk/Walk-3.png',
            'https://i.postimg.cc/mtqFrBWt/Walk-4.png',
            'https://i.postimg.cc/CZpBj710/Walk-5.png',
            'https://i.postimg.cc/sBPBKWQh/Walk-6.png',
            'https://i.postimg.cc/LYNJFMV4/Walk-7.png',
            'https://i.postimg.cc/0M8z4NDH/Walk-8.png',
            'https://i.postimg.cc/kRGBnhjQ/Walk-9.png',
            'https://i.postimg.cc/14mFCvK5/Walk-10.png',
        ], 
        speed: 150, 
        loop: true 
    },
    'attack': { 
        urls: [
            // e.g., '/assets/enemy/attack_01.png', ...
            'https://i.postimg.cc/SJLwSNMG/Attack-1.png',
           'https://i.postimg.cc/XrVtpSK6/Attack-2.png',
           'https://i.postimg.cc/2q9sscZR/Attack-3.png',
           'https://i.postimg.cc/YG45M664/Attack-4.png',
           'https://i.postimg.cc/XXCRPgNm/Attack-5.png',
           'https://i.postimg.cc/k6kk42sT/Attack-6.png',
           'https://i.postimg.cc/PvY08dFT/Attack-7.png',
           'https://i.postimg.cc/ppMwMnpT/Attack-8.png',
        ], 
        speed: 100, 
        loop: false 
    },
    'dead': {
        urls: [
            // e.g., '/assets/enemy/dead_01.png', ...
            'https://i.postimg.cc/D8DB39Cc/Dead-1.png',
            'https://i.postimg.cc/LJ1v9xwF/Dead-2.png',
            'https://i.postimg.cc/hJRsf9Rz/Dead-3.png',
            'https://i.postimg.cc/p9QZ8pP0/Dead-4.png',
            'https://i.postimg.cc/sQVJJsX3/Dead-5.png',
            'https://i.postimg.cc/MMdmPNMV/Dead-6.png',
            'https://i.postimg.cc/ZBZwD6ft/Dead-7.png',
            'https://i.postimg.cc/Q9bfLVPB/Dead-8.png',
            'https://i.postimg.cc/N2jpQBqd/Dead-9.png',
            'https://i.postimg.cc/HjYSw4cb/Dead-10.png',
            'https://i.postimg.cc/CdccmBkX/Dead-11.png',
            'https://i.postimg.cc/zV30MzkB/Dead-12.png',
        ],
        speed: 120,
        loop: false
    }
};