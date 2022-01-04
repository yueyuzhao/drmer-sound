import { BaseTexture } from '@pixi/core';
import { Sound } from '../Sound';
import { WebAudioMedia } from '../webaudio';

interface RenderOptions {
    width?: number;
    height?: number;
    fill?: string | CanvasPattern | CanvasGradient;
}

/**
 * Render image as Texture. **Only supported with WebAudio**
 * @static
 * @param {Sound} sound - Instance of sound to render
 * @param {Object} [options] - Custom rendering options
 * @param {number} [options.width=512] - Width of the render
 * @param {number} [options.height=128] - Height of the render
 * @param {string|CanvasPattern|CanvasGradient} [options.fill='black'] - Fill style for waveform
 * @return Result texture
 */
function render(sound: Sound, options?: RenderOptions): BaseTexture
{
    const canvas: HTMLCanvasElement = document.createElement('canvas');

    options = {
        width: 512,
        height: 128,
        fill: 'black', ...(options || {}) };

    canvas.width = options.width;
    canvas.height = options.height;

    const baseTexture = BaseTexture.from(canvas);

    if (!(sound.media instanceof WebAudioMedia))
    {
        return baseTexture;
    }

    const media: WebAudioMedia = sound.media as WebAudioMedia;

    // eslint-disable-next-line no-console
    console.assert(!!media.buffer, 'No buffer found, load first');

    const context: CanvasRenderingContext2D = canvas.getContext('2d');

    context.fillStyle = options.fill;
    const data: Float32Array = media.buffer.getChannelData(0);
    const step: number = Math.ceil(data.length / options.width);
    const amp: number = options.height / 2;

    for (let i = 0; i < options.width; i++)
    {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++)
        {
            const datum: number = data[(i * step) + j];

            if (datum < min)
            {
                min = datum;
            }
            if (datum > max)
            {
                max = datum;
            }
        }
        context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }

    return baseTexture;
}

export type { RenderOptions };
export { render };
