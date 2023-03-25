import {
    sound,
    Filterable,
    Sound,
    SoundLibrary,
    SoundSprite,
    filters,
    utils } from './index';

Object.defineProperties(sound,
    {
        Filterable: { get() { return Filterable; } },
        filters: { get() { return filters; } },
        Sound: { get() { return Sound; } },
        SoundLibrary: { get() { return SoundLibrary; } },
        SoundSprite: { get() { return SoundSprite; } },
        utils: { get() { return utils; } },
        sound: { get() { return sound; } },
    });

/**
 * For browser bundle, we'll wrap everything in a single default export.
 * This will be accessible from `PIXI.sound`. For the ESM/CJS bundles
 * we export everything as named.
 * @ignore
 */
export default sound;

