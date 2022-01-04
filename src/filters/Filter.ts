/**
 * Represents a single sound element. Can be used to play, pause, etc. sound instances.
 *
 * @class
 * @memberof filters
 */
import { WebAudioContext } from '../webaudio';

abstract class Filter
{
    private _context: WebAudioContext = null;

    /** The node to connect for the filter to the previous filter. */
    public destination: AudioNode;

    /** The node to connect for the filter to the previous filter. */
    public source: AudioNode;

    /** Reinitialize */
    protected init(destination: AudioNode, source?: AudioNode): void
    {
        this.destination = destination;
        this.source = source || destination;
    }

    public get context(): WebAudioContext
    {
        return this._context;
    }
    public set context(context: WebAudioContext)
    {
        if (this._context)
        {
            // eslint-disable-next-line no-console
            console.assert(this._context === context, 'AudioContext already bound to this filter');

            return;
        }
        this._context = context;
        this.setup();
    }

    protected abstract setup(): void;

    /**
     * Connect to the destination.
     * @param {AudioNode} destination - The destination node to connect the output to
     */
    public connect(destination: AudioNode): void
    {
        this.source.connect(destination);
    }

    /** Completely disconnect filter from destination and source nodes. */
    public disconnect(): void
    {
        this.source.disconnect();
    }

    /** Destroy the filter and don't use after this. */
    public destroy(): void
    {
        this.disconnect();
        this.destination = null;
        this.source = null;
    }
}

export { Filter };
