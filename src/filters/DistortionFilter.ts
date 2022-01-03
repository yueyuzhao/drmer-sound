import { getInstance } from '../instance';
import { Filter } from './Filter';

/**
 * Filter for adding adding delaynode.
 *
 * @class
 * @memberof filters
 */
class DistortionFilter extends Filter
{
    /** The Wave shape node use to distort */
    private _distortion: WaveShaperNode;

    /** The amount of distoration */
    private _amount: number;

    /** @param {number} [amount=0] - The amount of distoration from 0 to 1. */
    constructor(amount = 0)
    {
        const { context } = getInstance();
        const distortion: WaveShaperNode = context.audioContext.createWaveShaper();

        super(distortion);

        this._distortion = distortion;

        this.amount = amount;
    }

    /** @type {number} */
    set amount(value: number)
    {
        value *= 1000;
        this._amount = value;
        const samples = 44100;
        const curve: Float32Array = new Float32Array(samples);
        const deg: number = Math.PI / 180;

        let i = 0;
        let x: number;

        for (; i < samples; ++i)
        {
            x = (i * 2 / samples) - 1;
            curve[i] = (3 + value) * x * 20 * deg / (Math.PI + (value * Math.abs(x)));
        }
        this._distortion.curve = curve;
        this._distortion.oversample = '4x';
    }
    get amount(): number
    {
        return this._amount;
    }

    public destroy(): void
    {
        this._distortion = null;
        super.destroy();
    }
}

export { DistortionFilter };
