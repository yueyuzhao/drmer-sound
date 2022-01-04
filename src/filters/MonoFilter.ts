import { Filter } from './Filter';

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

    public destroy(): void
    {
        this._merger.disconnect();
        this._merger = null;
        super.destroy();
    }

    protected setup(): void
    {
        const audioContext = this.context.audioContext;
        const splitter = audioContext.createChannelSplitter();
        const merger = audioContext.createChannelMerger();

        merger.connect(splitter);
        this.init(merger, splitter);
        this._merger = merger;
    }
}

export { MonoFilter };
