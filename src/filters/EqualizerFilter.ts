import { Filter } from './Filter';

interface Band {
    f: number;
    type: string;
    gain: number;
}

interface EqualizerOptions {
    f32?: number;
    f64?: number;
    f125?: number;
    f250?: number;
    f500?: number;
    f1k?: number;
    f2k?: number;
    f4k?: number;
    f8k?: number;
    f16k?: number;
}

/**
 * Filter for adding equalizer bands.
 *
 * @class
 * @memberof filters
 * @param {number} [f32=0] - Default gain for 32 Hz
 * @param {number} [f64=0] - Default gain for 64 Hz
 * @param {number} [f125=0] - Default gain for 125 Hz
 * @param {number} [f250=0] - Default gain for 250 Hz
 * @param {number} [f500=0] - Default gain for 500 Hz
 * @param {number} [f1k=0] - Default gain for 1000 Hz
 * @param {number} [f2k=0] - Default gain for 2000 Hz
 * @param {number} [f4k=0] - Default gain for 4000 Hz
 * @param {number} [f8k=0] - Default gain for 8000 Hz
 * @param {number} [f16k=0] - Default gain for 16000 Hz
 */
class EqualizerFilter extends Filter
{
    private options: EqualizerOptions;
    /**
     * Band at 32 Hz
     * @readonly
     */
    public static readonly F32: number = 32;

    /**
     * Band at 64 Hz
     * @readonly
     */
    public static readonly F64: number = 64;

    /**
     * Band at 125 Hz
     * @readonly
     */
    public static readonly F125: number = 125;

    /**
     * Band at 250 Hz
     * @readonly
     */
    public static readonly F250: number = 250;

    /**
     * Band at 500 Hz
     * @readonly
     */
    public static readonly F500: number = 500;

    /**
     * Band at 1000 Hz
     * @readonly
     */
    public static readonly F1K: number = 1000;

    /**
     * Band at 2000 Hz
     * @readonly
     */
    public static readonly F2K: number = 2000;

    /**
     * Band at 4000 Hz
     * @readonly
     */
    public static readonly F4K: number = 4000;

    /**
     * Band at 8000 Hz
     * @readonly
     */
    public static readonly F8K: number = 8000;

    /**
     * Band at 16000 Hz
     * @readonly
     */
    public static readonly F16K: number = 16000;

    /**
     * The list of bands
     */
    private _bands: BiquadFilterNode[];

    /**
     * The map of bands to frequency
     */
    private _bandsMap: Record<string, BiquadFilterNode>;

    /**
     * @param {EqualizerOptions} options - the equalizer options
     */
    constructor(options?: EqualizerOptions)
    {
        super();
        this.options = {
            f32: 0,
            f64: 0,
            f125: 0,
            f250: 0,
            f500: 0,
            f1k: 0,
            f2k: 0,
            f4k: 0,
            f8k: 0,
            f16k: 0,
            ...options
        };
    }

    /**
     * Set gain on a specific frequency.
     * @param {number} frequency - The frequency, see EqualizerFilter.F* for bands
     * @param {number} [gain=0] - Recommended -40 to 40.
     */
    public setGain(frequency: number, gain = 0): void
    {
        if (!this.bandsMap[frequency])
        {
            throw new Error(`No band found for frequency ${frequency}`);
        }
        this.context.setParamValue(this.bandsMap[frequency].gain, gain);
    }

    /**
     * Get gain amount on a specific frequency.
     * @return The amount of gain set.
     */
    public getGain(frequency: number): number
    {
        if (!this.bandsMap[frequency])
        {
            throw new Error(`No band found for frequency ${frequency}`);
        }

        return this.bandsMap[frequency].gain.value;
    }

    /**
     * Gain at 32 Hz frequencey.
     * @type {number}
     * @default 0
     */
    public set f32(value: number)
    {
        this.setGain(EqualizerFilter.F32, value);
    }
    public get f32(): number
    {
        return this.getGain(EqualizerFilter.F32);
    }

    /**
     * Gain at 64 Hz frequencey.
     * @type {number}
     * @default 0
     */
    public set f64(value: number)
    {
        this.setGain(EqualizerFilter.F64, value);
    }
    public get f64(): number
    {
        return this.getGain(EqualizerFilter.F64);
    }

    /**
     * Gain at 125 Hz frequencey.
     * @type {number}
     * @default 0
     */
    public set f125(value: number)
    {
        this.setGain(EqualizerFilter.F125, value);
    }
    public get f125(): number
    {
        return this.getGain(EqualizerFilter.F125);
    }

    /**
     * Gain at 250 Hz frequencey.
     * @type {number}
     * @default 0
     */
    public set f250(value: number)
    {
        this.setGain(EqualizerFilter.F250, value);
    }
    public get f250(): number
    {
        return this.getGain(EqualizerFilter.F250);
    }

    /**
     * Gain at 500 Hz frequencey.
     * @type {number}
     * @default 0
     */
    public set f500(value: number)
    {
        this.setGain(EqualizerFilter.F500, value);
    }
    public get f500(): number
    {
        return this.getGain(EqualizerFilter.F500);
    }

    /**
     * Gain at 1 KHz frequencey.
     * @type {number}
     * @default 0
     */
    public set f1k(value: number)
    {
        this.setGain(EqualizerFilter.F1K, value);
    }
    public get f1k(): number
    {
        return this.getGain(EqualizerFilter.F1K);
    }

    /**
     * Gain at 2 KHz frequencey.
     * @type {number}
     * @default 0
     */
    public set f2k(value: number)
    {
        this.setGain(EqualizerFilter.F2K, value);
    }
    public get f2k(): number
    {
        return this.getGain(EqualizerFilter.F2K);
    }

    /**
     * Gain at 4 KHz frequencey.
     * @type {number}
     * @default 0
     */
    public set f4k(value: number)
    {
        this.setGain(EqualizerFilter.F4K, value);
    }
    public get f4k(): number
    {
        return this.getGain(EqualizerFilter.F4K);
    }

    /**
     * Gain at 8 KHz frequencey.
     * @type {number}
     * @default 0
     */
    public set f8k(value: number)
    {
        this.setGain(EqualizerFilter.F8K, value);
    }
    public get f8k(): number
    {
        return this.getGain(EqualizerFilter.F8K);
    }

    /**
     * Gain at 16 KHz frequencey.
     * @type {number}
     * @default 0
     */
    public set f16k(value: number)
    {
        this.setGain(EqualizerFilter.F16K, value);
    }
    public get f16k(): number
    {
        return this.getGain(EqualizerFilter.F16K);
    }

    /** Reset all frequency bands to have gain of 0 */
    public reset(): void
    {
        this.bands.forEach((band: BiquadFilterNode) =>
        {
            this.context.setParamValue(band.gain, 0);
        });
    }

    public destroy(): void
    {
        this.bands.forEach((band: BiquadFilterNode) =>
        {
            band.disconnect();
        });
        this._bands = null;
        this._bandsMap = null;
    }

    public get bands(): BiquadFilterNode[]
    {
        return this._bands;
    }

    public get bandsMap(): Record<string, BiquadFilterNode>
    {
        return this._bandsMap;
    }

    protected setup(): void
    {
        const equalizerBands: Band[] = [
            {
                f: EqualizerFilter.F32,
                type: 'lowshelf',
                gain: this.options.f32,
            },
            {
                f: EqualizerFilter.F64,
                type: 'peaking',
                gain: this.options.f64,
            },
            {
                f: EqualizerFilter.F125,
                type: 'peaking',
                gain: this.options.f125,
            },
            {
                f: EqualizerFilter.F250,
                type: 'peaking',
                gain: this.options.f250,
            },
            {
                f: EqualizerFilter.F500,
                type: 'peaking',
                gain: this.options.f500,
            },
            {
                f: EqualizerFilter.F1K,
                type: 'peaking',
                gain: this.options.f1k,
            },
            {
                f: EqualizerFilter.F2K,
                type: 'peaking',
                gain: this.options.f2k,
            },
            {
                f: EqualizerFilter.F4K,
                type: 'peaking',
                gain: this.options.f4k,
            },
            {
                f: EqualizerFilter.F8K,
                type: 'peaking',
                gain: this.options.f8k,
            },
            {
                f: EqualizerFilter.F16K,
                type: 'highshelf',
                gain: this.options.f16k,
            },
        ];

        const context = this.context;
        const bands: BiquadFilterNode[] = equalizerBands.map((band: Band) =>
        {
            const node: BiquadFilterNode = context.audioContext.createBiquadFilter();

            node.type = band.type as BiquadFilterType;
            context.setParamValue(node.Q, 1);
            node.frequency.value = band.f; // WebAudioUtils.setParamValue(filter.frequency, band.f);
            context.setParamValue(node.gain, band.gain);

            return node;
        });

        // Setup the constructor AudioNode, where first is the input, and last is the output
        this.init(bands[0], bands[bands.length - 1]);

        // Manipulate the bands
        this._bands = bands;

        // Create a map
        this._bandsMap = {};

        for (let i = 0; i < this._bands.length; i++)
        {
            const node: BiquadFilterNode = this._bands[i];

            // Connect the previous band to the current one
            if (i > 0)
            {
                this._bands[i - 1].connect(node);
            }
            this._bandsMap[node.frequency.value] = node;
        }
    }
}

export { EqualizerFilter };
