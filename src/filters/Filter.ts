/**
 * Represents a single sound element. Can be used to play, pause, etc. sound instances.
 *
 * @class
 * @memberof filters
 */
import { WebAudioContext } from '../webaudio/WebAudioContext';

class Filter
{
    protected readonly context: WebAudioContext;

    /** The node to connect for the filter to the previous filter. */
    public destination: AudioNode;

    /** The node to connect for the filter to the previous filter. */
    public source: AudioNode;

    /**
     * @param {WebAudioContext} context the audio context
     * @param {AudioNode} destination - The audio node to use as the destination for the input AudioNode
     * @param {AudioNode} [source] - Optional output node, defaults to destination node. This is useful
     *        when creating filters which contains multiple AudioNode elements chained together.
     */
    constructor(context: WebAudioContext, destination: AudioNode, source?: AudioNode)
    {
        this.context = context;
        this.init(destination, source);
    }

    /** Reinitialize */
    protected init(destination: AudioNode, source?: AudioNode): void
    {
        this.destination = destination;
        this.source = source || destination;
    }

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
