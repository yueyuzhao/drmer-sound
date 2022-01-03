import { Filter } from './Filter';
import { WebAudioContext } from '../webaudio/WebAudioContext';

/**
 * This filter does nothing to audio
 * but exports a MediaStream of the audio context
 * @class
 * @memberof filters
 */
class StreamFilter extends Filter
{
    private _stream: MediaStream;

    /**
     * @param {WebAudioContext} context - The audio context
     */
    constructor(context: WebAudioContext)
    {
        const audioContext: AudioContext = context.audioContext;
        const destination: MediaStreamAudioDestinationNode = audioContext.createMediaStreamDestination();
        const source: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(destination.stream);

        super(context, destination, source);
        this._stream = destination.stream;
    }

    public get stream(): MediaStream
    {
        return this._stream;
    }

    public destroy(): void
    {
        this._stream = null;
        super.destroy();
    }
}

export { StreamFilter };
