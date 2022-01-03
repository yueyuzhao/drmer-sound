import { Loader } from '@pixi/loaders';
import { sound } from './instance';
import { SoundLoader } from './SoundLoader';
import filters from './filters';
import webaudio from './webaudio';
import utils from './utils';

// Add the loader plugin
Loader.registerPlugin(SoundLoader);

export * from './Sound';
export * from './SoundLoader';
export * from './SoundLibrary';
export * from './Filterable';
export * from './filters/Filter';
export * from './SoundSprite';
export {
    sound,
    filters,
    webaudio,
    utils,
};
