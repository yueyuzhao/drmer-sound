import { Filter } from '../filters';
import { LoadedCallback, Sound } from '../Sound';
import { WebAudioContext, WebAudioInstance } from '../webaudio';

/**
 * Interface represents either a WebAudio source or an HTML5 AudioElement source
 */
interface IMedia
{

    /**
     * Collection of global filters
     * @type {Filter[]}
     */
    filters: Filter[];

    /**
     * Reference to the context.
     * @readonly
     * @type {IMediaContext}
     */
    readonly context: WebAudioContext;

    /**
     * Length of sound in seconds.
     * @readonly
     * @type {number}
     */
    readonly duration: number;

    /**
     * Flag to check if sound is currently playable (e.g., has been loaded/decoded).
     * @readonly
     * @type {boolean}
     */
    readonly isPlayable: boolean;

    // Internal methods
    create(): WebAudioInstance;
    init(sound: Sound): void;
    load(callback?: LoadedCallback): void;
    destroy(): void;
}

export type { IMedia };
