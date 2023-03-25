import { Filter } from './Filter';

/**
 * Filter for adding Stereo panning.
 *
 * @class
 * @memberof filters
 */
class StereoFilter extends Filter
{
    /** The stereo panning node */
    private _stereo: StereoPannerNode;

    /** The stereo panning node */
    private _panner: PannerNode;

    /** The amount of panning, -1 is left, 1 is right, 0 is centered */
    private _pan: number;

    /**
     * @param {number} pan - The amount of panning, -1 is left, 1 is right, 0 is centered.
     */
    constructor(pan = 0)
    {
        super();
        this._pan = pan;
    }

    /** Set the amount of panning, where -1 is left, 1 is right, and 0 is centered */
    set pan(value: number)
    {
        this._pan = value;
        if (!this.context)
        {
            return;
        }
        if (this._stereo)
        {
            this.context.setParamValue(this._stereo.pan, value);
        }
        else
        {
            this._panner.positionX.value = value;
            this._panner.positionY.value = 0;
            this._panner.positionZ.value = 1 - Math.abs(value);
        }
    }
    get pan(): number
    {
        return this._pan;
    }

    public destroy(): void
    {
        super.destroy();
        this._stereo = null;
        this._panner = null;
    }

    setup(): void
    {
        let stereo: StereoPannerNode;
        let panner: PannerNode;
        let destination: AudioNode;
        const audioContext = this.context.audioContext;

        if (audioContext.createStereoPanner)
        {
            stereo = audioContext.createStereoPanner();
            destination = stereo;
        }
        else
        {
            panner = audioContext.createPanner();
            panner.panningModel = 'equalpower';
            destination = panner;
        }

        this.init(destination);

        this._stereo = stereo;
        this._panner = panner;

        this.pan = this._pan;
    }
}

export { StereoFilter };
