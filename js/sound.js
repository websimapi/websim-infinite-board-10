export class SoundManager {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.buffers = new Map();
        this.loadSound('stepGrass', 'audio/step-grass.mp3');
        this.loadSound('stepSand', 'audio/step-sand.mp3');
        this.loadSound('splash', 'audio/water-splash.mp3');
        this.loadSound('swimLoop', 'audio/swim-loop.mp3');

        this.swimSource = null;
        this.swimGain = null;
    }

    async loadSound(key, url) {
        try {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers.set(key, audioBuffer);
        } catch(err) {
            console.warn('Audio load error', key, err);
        }
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    playStepGrass() {
        this.resume();
        const buffer = this.buffers.get('stepGrass');
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        // Play faster and cut duration in half as requested
        source.playbackRate.value = 1.2; 
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.4;

        source.connect(gain);
        gain.connect(this.ctx.destination);

        // Play only the first 50% of the sample
        const contentDuration = buffer.duration * 0.5; 
        const playDuration = contentDuration / source.playbackRate.value;

        source.start(0);
        
        // Quick fade out at the cut point to prevent clicking
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime + playDuration - 0.05);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + playDuration);
        
        source.stop(this.ctx.currentTime + playDuration);
    }

    playStepSand() {
        this.resume();
        this._playSimple('stepSand', 0.4);
    }

    playSplash() {
        this.resume();
        this._playSimple('splash', 0.5);
    }

    _playSimple(key, vol) {
        const buffer = this.buffers.get(key);
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        const gain = this.ctx.createGain();
        gain.gain.value = vol;

        source.connect(gain);
        gain.connect(this.ctx.destination);

        source.start(0);
    }

    setSwimming(isSwimming) {
        this.resume();
        
        if (isSwimming) {
            if (!this.swimSource) {
                const buffer = this.buffers.get('swimLoop');
                if (buffer) {
                    this.swimSource = this.ctx.createBufferSource();
                    this.swimSource.buffer = buffer;
                    this.swimSource.loop = true;
                    
                    this.swimGain = this.ctx.createGain();
                    this.swimGain.gain.value = 0.0;
                    
                    this.swimSource.connect(this.swimGain);
                    this.swimGain.connect(this.ctx.destination);
                    
                    const now = this.ctx.currentTime;
                    this.swimSource.start(0);
                    this.swimGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
                }
            }
        } else {
            if (this.swimSource) {
                const now = this.ctx.currentTime;
                if (this.swimGain) {
                    this.swimGain.gain.cancelScheduledValues(now);
                    this.swimGain.gain.setValueAtTime(this.swimGain.gain.value, now);
                    this.swimGain.gain.linearRampToValueAtTime(0, now + 0.3);
                }
                this.swimSource.stop(now + 0.3);
                this.swimSource = null;
                this.swimGain = null;
            }
        }
    }
}