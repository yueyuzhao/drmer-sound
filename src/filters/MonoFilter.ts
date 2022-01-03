import { Filter } from './Filter';
import { WebAudioContext } from '../webaudio/WebAudioContext';

/**
 * Combine all channels into mono channel.
 *
 * @class
 * @memberof filters
 */
class MonoFilter extends Filter
{
    /** Merger node */
    private _merger: ChannelMergerNode;

    /**
     * @param {WebAudioContext} context - The audio context
     */
    constructor(context: WebAudioContext)
    {
        const audioContext: AudioContext = context.audioContext;
        const splitter: ChannelSplitterNode = audioContext.createChannelSplitter();
        const merger: ChannelMergerNode = audioContext.createChannelMerger();

        merger.connect(splitter);
        super(context, merger, splitter);
        this._merger = merger;
    }

    public destroy(): void
    {
        this._merger.disconnect();
        this._merger = null;
        super.destroy();
    }
}

export { MonoFilter };
