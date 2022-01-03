import { ILoaderPlugin, ILoaderResource, LoaderResource } from '@pixi/loaders';
import { getInstance } from './instance';
import { resolveUrl } from './utils/resolveUrl';
import { extensions } from './utils/supported';

/**
 * Sound middleware installation utilities for PIXI.Loader
 * @class
 */
class SoundLoader implements ILoaderPlugin
{
    /** Install the middleware */
    public static add(): void
    {
        // Configure PIXI Loader to handle audio files correctly
        // Load all audio files as ArrayBuffers
        extensions.forEach((ext) =>
        {
            LoaderResource.setExtensionXhrType(ext, LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
            LoaderResource.setExtensionLoadType(ext, LoaderResource.LOAD_TYPE.XHR);
        });
    }

    /** Handle the preprocessing of file paths */
    public static pre(resource: ILoaderResource, next: () => void): void
    {
        resolveUrl(resource);
        next();
    }

    /** Actual resource-loader middleware for sound class */
    public static use(resource: ILoaderResource, next: () => void): void
    {
        if (resource.data && extensions.indexOf(resource.extension) > -1)
        {
            (resource as any).sound = getInstance().add(resource.name, {
                loaded: next,
                preload: true,
                url: resource.url,
                source: resource.data,
            });
        }
        else
        {
            next();
        }
    }
}

export { SoundLoader };
