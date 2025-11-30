export class SoundManager {
    constructor() {
        // Simple SFX setup using HTMLAudioElement.
        // You should place matching files in an /audio/ folder:
        //  - audio/step-grass.mp3
        //  - audio/step-sand.mp3
        //  - audio/water-splash.mp3
        //  - audio/swim-loop.mp3

        this.stepGrass = this._createOneShot('audio/step-grass.mp3', 0.35);
        this.stepSand = this._createOneShot('audio/step-sand.mp3', 0.35);
        this.splash = this._createOneShot('audio/water-splash.mp3', 0.45);

        this.swimLoop = new Audio('audio/swim-loop.mp3');
        this.swimLoop.loop = true;
        this.swimLoop.volume = 0.3;

        this.isSwimLoopPlaying = false;
    }

    _createOneShot(src, volume = 0.4) {
        const a = new Audio(src);
        a.volume = volume;
        return a;
    }

    _playOneShot(baseAudio) {
        if (!baseAudio) return;
        try {
            // Clone so overlapping steps don't cut each other off
            const a = baseAudio.cloneNode(true);
            a.play().catch(() => {});
        } catch (_) {}
    }

    playStepGrass() {
        this._playOneShot(this.stepGrass);
    }

    playStepSand() {
        this._playOneShot(this.stepSand);
    }

    playSplash() {
        this._playOneShot(this.splash);
    }

    setSwimming(isSwimming) {
        if (isSwimming) {
            if (!this.isSwimLoopPlaying) {
                this.swimLoop.currentTime = 0;
                this.swimLoop.play().catch(() => {});
                this.isSwimLoopPlaying = true;
            }
        } else {
            if (this.isSwimLoopPlaying) {
                this.swimLoop.pause();
                this.isSwimLoopPlaying = false;
            }
        }
    }
}