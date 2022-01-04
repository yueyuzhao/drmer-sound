import { Loader } from '@pixi/loaders';
export * from './instance';
import { SoundLoader } from './SoundLoader';
import * as filters from './filters';
import * as webaudio from './webaudio';
import * as utils from './utils';

// Add the loader plugin
Loader.registerPlugin(SoundLoader);

export * from './Sound';
export * from './SoundLoader';
export * from './SoundLibrary';
export * from './Filterable';
export * from './filters/Filter';
export * from './SoundSprite';

export {
    filters,
    webaudio,
    utils,
};
