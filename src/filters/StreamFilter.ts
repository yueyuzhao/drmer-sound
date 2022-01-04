import { Filter } from './Filter';

/**
 * This filter does nothing to audio
 * but exports a MediaStream of the audio context
 * @class
 * @memberof filters
 */
class StreamFilter extends Filter
{
    private _stream: MediaStream;

    public get stream(): MediaStream
    {
        return this._stream;
    }

    public destroy(): void
    {
        this._stream = null;
        super.destroy();
    }

    protected setup(): void
    {
        const audioContext = this.context.audioContext;
        const destination = audioContext.createMediaStreamDestination();
        const source = audioContext.createMediaStreamSource(destination.stream);

        this.init(destination, source);
        this._stream = destination.stream;
    }
}

export { StreamFilter };
