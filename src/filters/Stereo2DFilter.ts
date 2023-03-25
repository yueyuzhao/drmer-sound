import { Filter } from './Filter';

/**
 * Filter for adding 2D Stereo panning.
 *
 * @class
 * @memberof filters
 */
class Stereo2DFilter extends Filter
{
    /** The stereo panning node */
    private _panner: PannerNode;

    /** The amount of panning, -1 is left, 1 is right, 0 is centered */
    private _panX: number;

    /** The amount of panning, -1 is down, 1 is up, 0 is centered */
    private _panY: number;

    /**
     * @param {number} panX - The amount of panning, -1 is left, 1 is right, 0 is centered.
     * @param {number} panY - The amount of panning, -1 is down, 1 is up, 0 is centered.
     */
    constructor(panX = 0, panY = 0)
    {
        super();
        this._panX = panX;
        this._panY = panY;
    }

    /** Set the amount of panning, where -1 is left, 1 is right, and 0 is centered */
    set panX(value: number)
    {
        this._panX = value;
        if (!this.context)
        {
            return;
        }
        this._panner.positionX.value = value;
        this._panner.positionZ.value = 1 - Math.abs(value);
    }
    get panX(): number
    {
        return this._panX;
    }

    /** Set the amount of panning, where -1 is down, 1 is up, and 0 is centered */
    set panY(value: number)
    {
        this._panY = value;
        if (!this.context)
        {
            return;
        }
        this._panner.positionY.value = value;
    }
    get panY(): number
    {
        return this._panY;
    }

    public destroy(): void
    {
        super.destroy();
        this._panner = null;
    }

    setup(): void
    {
        const audioContext = this.context.audioContext;
        const panner: PannerNode = audioContext.createPanner();

        panner.panningModel = 'equalpower';
        const destination: AudioNode = panner;

        this.init(destination);

        this._panner = panner;

        this.panX = this._panX;
        this.panY = this._panY;
    }
}

export { Stereo2DFilter };
