/*!
 * @drmer/sound - v4.1.0
 * https://git.drmer.net/drmer/sound
 * Compiled Sun, 17 Apr 2022 12:28:35 UTC
 *
 * @drmer/sound is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */
this.PIXI = this.PIXI || {};
this.PIXI.sound = (function (loaders, ticker, utils$1, core) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * Object that represents a single Sound's sprite. To add sound sprites
     * use the {@link Sound#addSprites} method.
     * @class
     * @example
     * import { sound } from '@pixi/sound';
     * sound.add('alias', {
     *   url: 'path/to/file.ogg',
     *   sprites: {
     *     blast: { start: 0, end: 0.2 },
     *     boom: { start: 0.3, end: 0.5 },
     *   },
     *   loaded() {
     *     sound.play('alias', 'blast');
     *   }
     * );
     *
     */
    var SoundSprite = /** @class */ (function () {
        /**
         * @param parent - The parent sound
         * @param options - Data associated with object.
         */
        function SoundSprite(parent, options) {
            this.parent = parent;
            Object.assign(this, options);
            this.duration = this.end - this.start;
            // eslint-disable-next-line no-console
            console.assert(this.duration > 0, 'End time must be after start time');
        }
        /**
         * Play the sound sprite.
         * @param {Function} [complete] - Function call when complete
         * @return Sound instance being played.
         */
        SoundSprite.prototype.play = function (complete) {
            return this.parent.play({
                complete: complete,
                speed: this.speed || this.parent.speed,
                end: this.end,
                start: this.start,
                loop: this.loop
            });
        };
        /** Destroy and don't use after this */
        SoundSprite.prototype.destroy = function () {
            this.parent = null;
        };
        return SoundSprite;
    }());

    /**
     * The list of extensions that can be played.
     * @readonly
     * @static
     */
    var extensions = [
        'mp3',
        'ogg',
        'oga',
        'opus',
        'mpeg',
        'wav',
        'm4a',
        'aiff',
        'wma',
        'mid',
        'caf',
    ];
    /**
     * The list of browser supported audio formats.
     * @readonly
     * @static
     * @property {boolean} mp3 - `true` if file-type is supported
     * @property {boolean} ogg - `true` if file-type is supported
     * @property {boolean} oga - `true` if file-type is supported
     * @property {boolean} opus - `true` if file-type is supported
     * @property {boolean} mpeg - `true` if file-type is supported
     * @property {boolean} wav - `true` if file-type is supported
     * @property {boolean} aiff - `true` if file-type is supported
     * @property {boolean} wma - `true` if file-type is supported
     * @property {boolean} mid - `true` if file-type is supported
     * @property {boolean} caf - `true` if file-type is supported. Note that for this we check if the
     *                             'opus' codec is supported inside the caf container.
     */
    var supported = {};
    /**
     * Function to validate file type formats. This is called when the library initializes, but can
     * be called again if you need to recognize a format not listed in `utils.extensions` at
     * initialization.
     * @static
     * @param {object} typeOverrides - - Dictionary of type overrides (inputs for
     *                                 AudioElement.canPlayType()), keyed by extension from the
     *                                 utils.extensions array.
     */
    function validateFormats(typeOverrides) {
        var overrides = __assign({ m4a: 'audio/mp4', oga: 'audio/ogg', opus: 'audio/ogg; codecs="opus"', caf: 'audio/x-caf; codecs="opus"' }, (typeOverrides || {}));
        var audio = document.createElement('audio');
        var formats = {};
        var no = /^no$/;
        extensions.forEach(function (ext) {
            var canByExt = audio.canPlayType("audio/".concat(ext)).replace(no, '');
            var canByType = overrides[ext] ? audio.canPlayType(overrides[ext]).replace(no, '') : '';
            formats[ext] = !!canByExt || !!canByType;
        });
        Object.assign(supported, formats);
    }
    // initialize supported
    validateFormats();

    /**
     * RegExp for looking for format patterns.
     * @static
     */
    var FORMAT_PATTERN = /\.(\{([^\}]+)\})(\?.*)?$/;
    /**
     * Resolve a URL with different formats in glob pattern to
     * a path based on the supported browser format. For instance:
     * "sounds/music.{ogg,mp3}", would resolve to "sounds/music.ogg"
     * if "ogg" support is found, otherwise, fallback to "sounds.music.mp3"
     * @static
     * @param {string|PIXI.LoaderResource} source - - Path to resolve or Resource, if
     *        a Resource object is provided, automatically updates the extension and url
     *        of that object.
     * @return The format to resolve to
     */
    function resolveUrl(source) {
        // search for patterns like ".{mp3,ogg}""
        var glob = FORMAT_PATTERN;
        var url = typeof source === 'string' ? source : source.url;
        if (!glob.test(url)) {
            return url;
        }
        var match = glob.exec(url);
        var exts = match[2].split(',');
        var replace = exts[exts.length - 1]; // fallback to last ext
        for (var i = 0, len = exts.length; i < len; i++) {
            var ext = exts[i];
            if (supported[ext]) {
                replace = ext;
                break;
            }
        }
        var resolved = url.replace(match[1], replace);
        if (!(typeof source === 'string')) {
            // resource-loader marks these as readonly
            var writableSource = source;
            writableSource.extension = replace;
            writableSource.url = resolved;
        }
        return resolved;
    }

    var id = 0;
    /**
     * A single play instance that handles the AudioBufferSourceNode.
     * @class
     * @memberof webaudio
     */
    var WebAudioInstance = /** @class */ (function (_super) {
        __extends(WebAudioInstance, _super);
        function WebAudioInstance(media) {
            var _this = _super.call(this) || this;
            _this._filters = null;
            _this.id = id++;
            _this._media = null;
            _this._paused = false;
            _this._muted = false;
            _this._elapsed = 0;
            // Initialize
            _this.init(media);
            return _this;
        }
        /**
         * Set a property by name, this makes it easy to chain values
         * @param {string} name - - Values include: 'speed', 'volume', 'muted', 'loop', 'paused'
         * @param {number|boolean} value - - Value to set property to
         */
        WebAudioInstance.prototype.set = function (name, value) {
            if (this[name] === undefined) {
                throw new Error("Property with name ".concat(name, " does not exist."));
            }
            else {
                switch (name) {
                    case 'speed':
                        this.speed = value;
                        break;
                    case 'volume':
                        this.volume = value;
                        break;
                    case 'muted':
                        this.muted = value;
                        break;
                    case 'loop':
                        this.loop = value;
                        break;
                    case 'paused':
                        this.paused = value;
                        break;
                }
            }
            return this;
        };
        /** Stops the instance, don't use after this. */
        WebAudioInstance.prototype.stop = function () {
            if (this._source) {
                this._internalStop();
                this.emit('stop');
            }
        };
        Object.defineProperty(WebAudioInstance.prototype, "speed", {
            /** Set the instance speed from 0 to 1 */
            get: function () {
                return this._speed;
            },
            set: function (speed) {
                this._speed = speed;
                this.refresh();
                this._update(true); // update progress
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioInstance.prototype, "volume", {
            /** Get the set the volume for this instance from 0 to 1 */
            get: function () {
                return this._volume;
            },
            set: function (volume) {
                this._volume = volume;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioInstance.prototype, "muted", {
            /** `true` if the sound is muted */
            get: function () {
                return this._muted;
            },
            set: function (muted) {
                this._muted = muted;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioInstance.prototype, "loop", {
            /** If the sound instance should loop playback */
            get: function () {
                return this._loop;
            },
            set: function (loop) {
                this._loop = loop;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioInstance.prototype, "filters", {
            /**
             * The filters for the sound instance
             */
            get: function () {
                return this._filters;
            },
            set: function (filters) {
                if (this._filters) {
                    this._filters.forEach(function (filter) {
                        if (filter) {
                            filter.disconnect();
                        }
                    });
                    this._filters = null;
                    // Reconnect direct path
                    this._source.connect(this._gain);
                }
                if (filters && filters.length) {
                    this._filters = filters.slice(0);
                }
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioInstance.prototype, "context", {
            get: function () {
                return this._media.context;
            },
            enumerable: false,
            configurable: true
        });
        /** Refresh loop, volume and speed based on changes to parent */
        WebAudioInstance.prototype.refresh = function () {
            // Sound could be paused
            if (!this._source) {
                return;
            }
            var global = this._media.context;
            var sound = this._media.parent;
            // Updating looping
            this._source.loop = this._loop || sound.loop;
            // Update the volume
            var globalVolume = global.volume * (global.muted ? 0 : 1);
            var soundVolume = sound.volume * (sound.muted ? 0 : 1);
            var instanceVolume = this._volume * (this._muted ? 0 : 1);
            this.applyFilters();
            this.context.setParamValue(this._gain.gain, instanceVolume * soundVolume * globalVolume);
            // Update the speed
            this.context.setParamValue(this._source.playbackRate, this._speed * sound.speed * global.speed);
        };
        WebAudioInstance.prototype.applyFilters = function () {
            var _this = this;
            if (this._filters && this._filters.length) {
                // Disconnect direct path before inserting filters
                this._source.disconnect();
                // Connect each filter
                var prevFilter_1 = null;
                this._filters.forEach(function (filter) {
                    filter.context = _this.context;
                    if (prevFilter_1 === null) {
                        // first filter is the destination
                        // for the analyser
                        _this._source.connect(filter.destination);
                    }
                    else {
                        prevFilter_1.connect(filter.destination);
                    }
                    prevFilter_1 = filter;
                });
                prevFilter_1.connect(this._gain);
            }
        };
        /** Handle changes in paused state, either globally or sound or instance */
        WebAudioInstance.prototype.refreshPaused = function () {
            var global = this._media.context;
            var sound = this._media.parent;
            // Consider global and sound paused
            var pausedReal = this._paused || sound.paused || global.paused;
            if (pausedReal !== this._pausedReal) {
                this._pausedReal = pausedReal;
                if (pausedReal) {
                    // pause the sounds
                    this._internalStop();
                    /**
                     * The sound is paused.
                     * @event paused
                     */
                    this.emit('paused');
                }
                else {
                    /**
                     * The sound is unpaused.
                     * @event resumed
                     */
                    this.emit('resumed');
                    // resume the playing with offset
                    this.play({
                        start: this._elapsed % this._duration,
                        end: this._end,
                        speed: this._speed,
                        loop: this._loop,
                        volume: this._volume,
                    });
                }
                /**
                 * The sound is paused or unpaused.
                 * @event pause
                 * @property {boolean} paused - If the instance was paused or not.
                 */
                this.emit('pause', pausedReal);
            }
        };
        /**
         * Plays the sound.
         * @param {Object} options - Play options
         * @param {number} options.start - The position to start playing, in seconds.
         * @param {number} options.end - The ending position in seconds.
         * @param {number} options.speed - Speed for the instance
         * @param {boolean} options.loop - If the instance is looping, defaults to sound loop
         * @param {number} options.volume - Volume of the instance
         * @param {boolean} options.muted - Muted state of instance
         */
        WebAudioInstance.prototype.play = function (options) {
            var start = options.start, end = options.end, speed = options.speed, loop = options.loop, volume = options.volume, muted = options.muted, filters = options.filters;
            if (end) {
                // eslint-disable-next-line no-console
                console.assert(end > start, 'End time is before start time');
            }
            this._paused = false;
            var _a = this._media.nodes.cloneBufferSource(), source = _a.source, gain = _a.gain;
            this._source = source;
            this._gain = gain;
            this._speed = speed;
            this._volume = volume;
            this._loop = !!loop;
            this._filters = filters;
            this._muted = muted;
            this.refresh();
            this._duration = this._source.buffer.duration;
            this._end = end;
            this._lastUpdate = this._now();
            this._elapsed = start;
            this._source.onended = this._onComplete.bind(this);
            if (this._loop) {
                this._source.loopEnd = end;
                this._source.loopStart = start;
                this._source.start(0, start);
            }
            else if (end) {
                this._source.start(0, start, end - start);
            }
            else {
                this._source.start(0, start);
            }
            /**
             * The sound is started.
             * @event start
             */
            this.emit('start');
            // Do an update for the initial progress
            this._update(true);
            // Start handling internal ticks
            this.enableTicker(true);
        };
        /**
         * Start the update progress.
         * @type {boolean}
         */
        WebAudioInstance.prototype.enableTicker = function (enabled) {
            ticker.Ticker.shared.remove(this._updateListener, this);
            if (enabled) {
                ticker.Ticker.shared.add(this._updateListener, this);
            }
        };
        Object.defineProperty(WebAudioInstance.prototype, "progress", {
            /**
             * The current playback progress from 0 to 1.
             * @type {number}
             */
            get: function () {
                return this._progress;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioInstance.prototype, "paused", {
            /**
             * Pauses the sound.
             * @type {boolean}
             */
            get: function () {
                return this._paused;
            },
            set: function (paused) {
                this._paused = paused;
                this.refreshPaused();
            },
            enumerable: false,
            configurable: true
        });
        /** Don't use after this. */
        WebAudioInstance.prototype.destroy = function () {
            this.removeAllListeners();
            this._internalStop();
            if (this._gain) {
                this._gain.disconnect();
                this._gain = null;
            }
            if (this._media) {
                this._media.context.events.off('refresh', this.refresh, this);
                this._media.context.events.off('refreshPaused', this.refreshPaused, this);
                this._media = null;
            }
            if (this._filters) {
                this._filters.forEach(function (filter) {
                    filter.disconnect();
                    filter.destroy();
                });
            }
            this._filters = null;
            this._end = null;
            this._speed = 1;
            this._volume = 1;
            this._loop = false;
            this._elapsed = 0;
            this._duration = 0;
            this._paused = false;
            this._muted = false;
            this._pausedReal = false;
        };
        /**
         * To string method for instance.
         * @return The string representation of instance.
         */
        WebAudioInstance.prototype.toString = function () {
            return "[WebAudioInstance id=".concat(this.id, "]");
        };
        /**
         * Get the current time in seconds.
         * @return Seconds since start of context
         */
        WebAudioInstance.prototype._now = function () {
            return this._media.context.audioContext.currentTime;
        };
        /**
         * Callback for update listener
         * @type {Function}
         */
        WebAudioInstance.prototype._updateListener = function () {
            this._update();
        };
        /** Internal update the progress. */
        WebAudioInstance.prototype._update = function (force) {
            if (force === void 0) { force = false; }
            if (this._source) {
                var now = this._now();
                var delta = now - this._lastUpdate;
                if (delta > 0 || force) {
                    var speed = this._source.playbackRate.value;
                    this._elapsed += delta * speed;
                    this._lastUpdate = now;
                    var duration = this._duration;
                    var progress = void 0;
                    if (this._source.loopStart) {
                        var soundLength = this._source.loopEnd - this._source.loopStart;
                        progress = (this._source.loopStart + (this._elapsed % soundLength)) / duration;
                    }
                    else {
                        progress = (this._elapsed % duration) / duration;
                    }
                    // Update the progress
                    this._progress = progress;
                    /**
                     * The sound progress is updated.
                     * @event progress
                     * @property {number} progress - Amount progressed from 0 to 1
                     * @property {number} duration - The total playback in seconds
                     */
                    this.emit('progress', this._progress, duration);
                }
            }
        };
        /** Initializes the instance. */
        WebAudioInstance.prototype.init = function (media) {
            this._media = media;
            media.context.events.on('refresh', this.refresh, this);
            media.context.events.on('refreshPaused', this.refreshPaused, this);
        };
        /** Stops the instance. */
        WebAudioInstance.prototype._internalStop = function () {
            if (this._source) {
                this.enableTicker(false);
                this._source.onended = null;
                this._source.stop(0); // param needed for iOS 8 bug
                this._source.disconnect();
                try {
                    this._source.buffer = null;
                }
                catch (err) {
                    // try/catch workaround for bug in older Chrome versions
                    console.warn('Failed to set AudioBufferSourceNode.buffer to null:', err);
                }
                this._source = null;
            }
        };
        /** Callback when completed. */
        WebAudioInstance.prototype._onComplete = function () {
            if (this._source) {
                this.enableTicker(false);
                this._source.onended = null;
                this._source.disconnect();
                try {
                    this._source.buffer = null;
                }
                catch (err) {
                    // try/catch workaround for bug in older Chrome versions
                    console.warn('Failed to set AudioBufferSourceNode.buffer to null:', err);
                }
            }
            this._source = null;
            this._progress = 1;
            this.emit('progress', 1, this._duration);
            /**
             * The sound ends, don't use after this
             * @event end
             */
            this.emit('end', this);
        };
        return WebAudioInstance;
    }(utils$1.EventEmitter));

    /**
     * Abstract class which SoundNodes and SoundContext
     * both extend. This provides the functionality for adding
     * dynamic filters.
     * @class
     */
    var Filterable = /** @class */ (function () {
        /**
         * @param {AudioNode} input - The source audio node
         * @param {AudioNode} output - The output audio node
         */
        function Filterable(input, output) {
            this._output = output;
            this._input = input;
        }
        Object.defineProperty(Filterable.prototype, "destination", {
            /** The destination output audio node */
            get: function () {
                return this._input;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Filterable.prototype, "filters", {
            /**
             * The collection of filters
             * @type {filters.Filter[]}
             */
            get: function () {
                return this._filters;
            },
            set: function (filters) {
                var _this = this;
                if (this._filters) {
                    this._filters.forEach(function (filter) {
                        if (filter) {
                            filter.disconnect();
                        }
                    });
                    this._filters = null;
                    // Reconnect direct path
                    this._input.connect(this._output);
                }
                if (filters && filters.length) {
                    this._filters = filters.slice(0);
                    // Disconnect direct path before inserting filters
                    this._input.disconnect();
                    // Connect each filter
                    var prevFilter_1 = null;
                    filters.forEach(function (filter) {
                        filter.context = _this.getContext();
                        if (prevFilter_1 === null) {
                            // first filter is the destination
                            // for the analyser
                            _this._input.connect(filter.destination);
                        }
                        else {
                            prevFilter_1.connect(filter.destination);
                        }
                        prevFilter_1 = filter;
                    });
                    prevFilter_1.connect(this._output);
                }
            },
            enumerable: false,
            configurable: true
        });
        /** Cleans up. */
        Filterable.prototype.destroy = function () {
            this.filters = null;
            this._input = null;
            this._output = null;
        };
        return Filterable;
    }());

    /**
     * @class
     * @memberof webaudio
     */
    var WebAudioNodes = /** @class */ (function (_super) {
        __extends(WebAudioNodes, _super);
        /**
         * @param {webaudio.WebAudioContext} context - The audio context.
         */
        function WebAudioNodes(context) {
            var _this = this;
            var audioContext = context.audioContext;
            var bufferSource = audioContext.createBufferSource();
            var gain = audioContext.createGain();
            var analyser = audioContext.createAnalyser();
            bufferSource.connect(analyser);
            analyser.connect(gain);
            gain.connect(context.destination);
            _this = _super.call(this, analyser, gain) || this;
            _this.context = context;
            _this.bufferSource = bufferSource;
            _this.gain = gain;
            _this.analyser = analyser;
            return _this;
        }
        Object.defineProperty(WebAudioNodes.prototype, "script", {
            /**
             * Get the script processor node.
             * @readonly
             * @type {ScriptProcessorNode}
             */
            get: function () {
                if (!this._script) {
                    this._script = this.context.audioContext.createScriptProcessor(WebAudioNodes.BUFFER_SIZE);
                    this._script.connect(this.context.destination);
                }
                return this._script;
            },
            enumerable: false,
            configurable: true
        });
        /** Cleans up. */
        WebAudioNodes.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.bufferSource.disconnect();
            if (this._script) {
                this._script.disconnect();
            }
            this.gain.disconnect();
            this.analyser.disconnect();
            this.bufferSource = null;
            this._script = null;
            this.gain = null;
            this.analyser = null;
            this.context = null;
        };
        /**
         * Clones the bufferSource. Used just before playing a sound.
         * @returns {SourceClone} The clone AudioBufferSourceNode.
         */
        WebAudioNodes.prototype.cloneBufferSource = function () {
            var orig = this.bufferSource;
            var source = this.context.audioContext.createBufferSource();
            source.buffer = orig.buffer;
            this.context.setParamValue(source.playbackRate, orig.playbackRate.value);
            source.loop = orig.loop;
            var gain = this.context.audioContext.createGain();
            source.connect(gain);
            gain.connect(this.destination);
            return { source: source, gain: gain };
        };
        Object.defineProperty(WebAudioNodes.prototype, "bufferSize", {
            /**
             * Get buffer size of `ScriptProcessorNode`.
             * @readonly
             * @type {number}
             */
            get: function () {
                return this.script.bufferSize;
            },
            enumerable: false,
            configurable: true
        });
        WebAudioNodes.prototype.getContext = function () {
            return this.context;
        };
        /**
         * The buffer size for script processor, default is `0` which auto-detects. If you plan to use
         * script node on iOS, you'll need to provide a non-zero amount.
         * @type {number}
         * @default 0
         */
        WebAudioNodes.BUFFER_SIZE = 0;
        return WebAudioNodes;
    }(Filterable));

    /**
     * Represents a single sound element. Can be used to play, pause, etc. sound instances.
     * @class
     * @memberof webaudio
     */
    var WebAudioMedia = /** @class */ (function () {
        function WebAudioMedia() {
        }
        /**
         * Re-initialize without constructing.
         * @param {Sound} parent - - Instance of parent Sound container
         */
        WebAudioMedia.prototype.init = function (parent) {
            this.parent = parent;
            this._nodes = new WebAudioNodes(this.context);
            this._source = this._nodes.bufferSource;
            this.source = parent.options.source;
        };
        /** Destructor, safer to use `SoundLibrary.remove(alias)` to remove this sound. */
        WebAudioMedia.prototype.destroy = function () {
            this.parent = null;
            this._nodes.destroy();
            this._nodes = null;
            try {
                this._source.buffer = null;
            }
            catch (err) {
                // try/catch workaround for bug in older Chrome versions
                console.warn('Failed to set AudioBufferSourceNode.buffer to null:', err);
            }
            this._source = null;
            this.source = null;
        };
        // Implement create
        WebAudioMedia.prototype.create = function () {
            return new WebAudioInstance(this);
        };
        Object.defineProperty(WebAudioMedia.prototype, "context", {
            // Implement context
            get: function () {
                return this.parent.context;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioMedia.prototype, "isPlayable", {
            // Implement isPlayable
            get: function () {
                return !!this._source && !!this._source.buffer;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioMedia.prototype, "filters", {
            // Implement filters
            get: function () {
                return this._nodes.filters;
            },
            set: function (filters) {
                this._nodes.filters = filters;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioMedia.prototype, "duration", {
            // Implements duration
            get: function () {
                // eslint-disable-next-line no-console
                console.assert(this.isPlayable, 'Sound not yet playable, no duration');
                return this._source.buffer.duration;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioMedia.prototype, "buffer", {
            /** Gets and sets the buffer. */
            get: function () {
                return this._source.buffer;
            },
            set: function (buffer) {
                this._source.buffer = buffer;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioMedia.prototype, "nodes", {
            /**
             * Get the current chained nodes object
             * @type {webaudio.WebAudioNodes}
             */
            get: function () {
                return this._nodes;
            },
            enumerable: false,
            configurable: true
        });
        // Implements load
        WebAudioMedia.prototype.load = function (callback) {
            // Load from the arraybuffer, incase it was loaded outside
            if (this.source) {
                this._decode(this.source, callback);
            }
            // Load from the file path
            else if (this.parent.url) {
                this._loadUrl(callback);
            }
            else if (callback) {
                callback(new Error('sound.url or sound.source must be set'));
            }
            else {
                console.error('sound.url or sound.source must be set');
            }
        };
        /** Loads a sound using XHMLHttpRequest object. */
        WebAudioMedia.prototype._loadUrl = function (callback) {
            var _this = this;
            var request = new XMLHttpRequest();
            var url = this.parent.url;
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            // Decode asynchronously
            request.onload = function () {
                _this.source = request.response;
                _this._decode(request.response, callback);
            };
            // actually start the request
            request.send();
        };
        /**
         * Decodes the array buffer.
         * @param arrayBuffer - From load.
         * @param {Function} callback - Callback optional
         */
        WebAudioMedia.prototype._decode = function (arrayBuffer, callback) {
            var _this = this;
            var audioBufferReadyFn = function (err, buffer) {
                if (err) {
                    if (callback) {
                        callback(err);
                    }
                }
                else {
                    _this.parent.isLoaded = true;
                    _this.buffer = buffer;
                    var instance = _this.parent.autoPlayStart();
                    if (callback) {
                        callback(null, _this.parent, instance);
                    }
                }
            };
            if (arrayBuffer instanceof AudioBuffer) {
                audioBufferReadyFn(null, arrayBuffer);
            }
            else {
                var context_1 = this.parent.context;
                context_1.decode(arrayBuffer, audioBufferReadyFn);
            }
        };
        return WebAudioMedia;
    }());

    /**
     * Main class to handle WebAudio API. There's a simple chain
     * of AudioNode elements: analyser > compressor > context.destination.
     * any filters that are added are inserted between the analyser and compressor nodes
     * @class
     * @memberof webaudio
     */
    var WebAudioContext = /** @class */ (function (_super) {
        __extends(WebAudioContext, _super);
        function WebAudioContext() {
            var _this = this;
            var win = window;
            var ctx = new WebAudioContext.AudioContext();
            var compressor = ctx.createDynamicsCompressor();
            var analyser = ctx.createAnalyser();
            // setup the end of the node chain
            analyser.connect(compressor);
            compressor.connect(ctx.destination);
            _this = _super.call(this, analyser, compressor) || this;
            _this._ctx = ctx;
            // ios11 safari's webkitOfflineAudioContext allows only 44100 Hz sample rate
            _this._offlineCtx = new WebAudioContext.OfflineAudioContext(1, 2, (win.OfflineAudioContext) ? ctx.sampleRate : 44100);
            _this._unlocked = false;
            _this.compressor = compressor;
            _this.analyser = analyser;
            _this.events = new utils$1.EventEmitter();
            // Set the defaults
            _this.volume = 1;
            _this.speed = 1;
            _this.muted = false;
            _this.paused = false;
            // Listen for document level clicks to unlock WebAudio. See the _unlock method.
            if (ctx.state !== 'running') {
                _this._unlock(); // When played inside of a touch event, this will enable audio on iOS immediately.
                _this._unlock = _this._unlock.bind(_this);
                document.addEventListener('mousedown', _this._unlock, true);
                document.addEventListener('touchstart', _this._unlock, true);
                document.addEventListener('touchend', _this._unlock, true);
            }
            return _this;
        }
        /**
         * Try to unlock audio on iOS. This is triggered from either WebAudio plugin setup (which will work if inside of
         * a `mousedown` or `touchend` event stack), or the first document touchend/mousedown event. If it fails (touchend
         * will fail if the user presses for too long, indicating a scroll event instead of a click event.
         *
         * Note that earlier versions of iOS supported `touchstart` for this, but iOS9 removed this functionality. Adding
         * a `touchstart` event to support older platforms may preclude a `mousedown` even from getting fired on iOS9, so we
         * stick with `mousedown` and `touchend`.
         */
        WebAudioContext.prototype._unlock = function () {
            if (this._unlocked) {
                return;
            }
            this.playEmptySound();
            if (this._ctx.state === 'running') {
                document.removeEventListener('mousedown', this._unlock, true);
                document.removeEventListener('touchend', this._unlock, true);
                document.removeEventListener('touchstart', this._unlock, true);
                this._unlocked = true;
            }
        };
        /**
         * Plays an empty sound in the web audio context.  This is used to enable web audio on iOS devices, as they
         * require the first sound to be played inside of a user initiated event (touch/click).
         */
        WebAudioContext.prototype.playEmptySound = function () {
            var source = this._ctx.createBufferSource();
            source.buffer = this._ctx.createBuffer(1, 1, 22050);
            source.connect(this._ctx.destination);
            source.start(0, 0, 0);
            if (source.context.state === 'suspended') {
                source.context.resume();
            }
        };
        Object.defineProperty(WebAudioContext, "AudioContext", {
            /**
             * Get AudioContext class, if not supported returns `null`
             * @readonly
             * @type {AudioContext}
             */
            get: function () {
                var win = window;
                return (win.AudioContext
                    || win.webkitAudioContext
                    || null);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioContext, "OfflineAudioContext", {
            /**
             * Get OfflineAudioContext class, if not supported returns `null`
             * @type {OfflineAudioContext}
             * @readonly
             */
            get: function () {
                var win = window;
                return (win.OfflineAudioContext
                    || win.webkitOfflineAudioContext
                    || null);
            },
            enumerable: false,
            configurable: true
        });
        /** Destroy this context. */
        WebAudioContext.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            var ctx = this._ctx;
            // check if browser supports AudioContext.close()
            if (typeof ctx.close !== 'undefined') {
                ctx.close();
            }
            this.events.removeAllListeners();
            this.analyser.disconnect();
            this.compressor.disconnect();
            this.analyser = null;
            this.compressor = null;
            this.events = null;
            this._offlineCtx = null;
            this._ctx = null;
        };
        Object.defineProperty(WebAudioContext.prototype, "audioContext", {
            /**
             * The WebAudio API AudioContext object.
             * @readonly
             * @type {AudioContext}
             */
            get: function () {
                return this._ctx;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioContext.prototype, "offlineContext", {
            /**
             * The WebAudio API OfflineAudioContext object.
             * @readonly
             * @type {OfflineAudioContext}
             */
            get: function () {
                return this._offlineCtx;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WebAudioContext.prototype, "paused", {
            get: function () {
                return this._paused;
            },
            /**
             * Pauses all sounds, even though we handle this at the instance
             * level, we'll also pause the audioContext so that the
             * time used to compute progress isn't messed up.
             * @type {boolean}
             * @default false
             */
            set: function (paused) {
                if (paused && this._ctx.state === 'running') {
                    this._ctx.suspend();
                }
                else if (!paused && this._ctx.state === 'suspended') {
                    this._ctx.resume();
                }
                this._paused = paused;
            },
            enumerable: false,
            configurable: true
        });
        /** Emit event when muted, volume or speed changes */
        WebAudioContext.prototype.refresh = function () {
            this.events.emit('refresh');
        };
        /** Emit event when muted, volume or speed changes */
        WebAudioContext.prototype.refreshPaused = function () {
            this.events.emit('refreshPaused');
        };
        /**
         * Toggles the muted state.
         * @return The current muted state.
         */
        WebAudioContext.prototype.toggleMute = function () {
            this.muted = !this.muted;
            this.refresh();
            return this.muted;
        };
        /**
         * Toggles the paused state.
         * @return The current muted state.
         */
        WebAudioContext.prototype.togglePause = function () {
            this.paused = !this.paused;
            this.refreshPaused();
            return this._paused;
        };
        /**
         * Decode the audio data
         * @param {ArrayBuffer} arrayBuffer - Buffer from loader
         * @param {Function} callback - When completed, error and audioBuffer are parameters.
         */
        WebAudioContext.prototype.decode = function (arrayBuffer, callback) {
            var handleError = function (err) {
                callback(new Error(err.message || 'Unable to decode file'));
            };
            var result = this._offlineCtx.decodeAudioData(arrayBuffer, function (buffer) {
                callback(null, buffer);
            }, handleError);
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData
            // decodeAudioData return value: Void, or a Promise object that fulfills with the decodedData.
            if (result) {
                result.catch(handleError);
            }
        };
        WebAudioContext.prototype.setParamValue = function (param, value) {
            if (param.setValueAtTime) {
                param.setValueAtTime(value, this.audioContext.currentTime);
            }
            else {
                param.value = value;
            }
            return value;
        };
        WebAudioContext.prototype.getContext = function () {
            return this;
        };
        return WebAudioContext;
    }(Filterable));

    /**
     * Sound represents a single piece of loaded media. When playing a sound `WebAudioInstance` objects
     * are created. Properties such a `volume`, `pause`, `mute`, `speed`, etc will have an effect on all instances.
     * @class
     */
    var Sound = /** @class */ (function () {
        /**
         * Use `Sound.from`
         * @ignore
         */
        function Sound(media, options) {
            this._context = options.context;
            this.media = media;
            this.options = options;
            this._instances = [];
            this._sprites = {};
            this.media.init(this);
            var complete = options.complete;
            this._autoPlayOptions = complete ? { complete: complete } : null;
            this.isLoaded = false;
            this.isPlaying = false;
            this.autoPlay = options.autoPlay;
            this.singleInstance = options.singleInstance;
            this.preload = options.preload || this.autoPlay;
            this.url = options.url;
            this.speed = options.speed;
            this.volume = options.volume;
            this.loop = options.loop;
            if (options.sprites) {
                this.addSprites(options.sprites);
            }
            if (this.preload) {
                this._preload(options.loaded);
            }
        }
        /**
         * Create a new sound instance from source.
         * @param {ArrayBuffer|AudioBuffer|String|Options|HTMLAudioElement} source - Either the path or url to the source file.
         *        or the object of options to use.
         * @return Created sound instance.
         */
        Sound.from = function (source) {
            var options = {};
            if (typeof source === 'string') {
                options.url = source;
            }
            else if (source instanceof ArrayBuffer || source instanceof AudioBuffer || source instanceof HTMLAudioElement) {
                options.source = source;
            }
            else {
                options = source;
            }
            // Default settings
            options = __assign({ autoPlay: false, singleInstance: false, url: null, source: null, preload: false, volume: 1, speed: 1, complete: null, loaded: null, context: null, loop: false }, options);
            if (options.context === null) {
                options.context = new WebAudioContext();
            }
            // Resolve url in-case it has a special format
            if (options.url) {
                options.url = resolveUrl(options.url);
            }
            Object.freeze(options);
            return new Sound(new WebAudioMedia(), options);
        };
        Object.defineProperty(Sound.prototype, "context", {
            /**
             * Instance of the media context
             * @type {WebAudioContext}
             */
            get: function () {
                return this._context;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Stops all the instances of this sound from playing.
         * @return Instance of this sound.
         */
        Sound.prototype.pause = function () {
            this.isPlaying = false;
            this.paused = true;
            return this;
        };
        /**
         * Resuming all the instances of this sound from playing
         * @return Instance of this sound.
         */
        Sound.prototype.resume = function () {
            this.isPlaying = this._instances.length > 0;
            this.paused = false;
            return this;
        };
        Object.defineProperty(Sound.prototype, "paused", {
            /** Stops all the instances of this sound from playing. */
            get: function () {
                return this._paused;
            },
            set: function (paused) {
                this._paused = paused;
                this.refreshPaused();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "speed", {
            /** The playback rate */
            get: function () {
                return this._speed;
            },
            set: function (speed) {
                this._speed = speed;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "filters", {
            /**
             * Set the filters. Only supported with WebAudio.
             * @type {Array<filters.Filter>}
             */
            get: function () {
                return this.media.filters;
            },
            set: function (filters) {
                this.media.filters = filters;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @ignore
         */
        Sound.prototype.addSprites = function (source, data) {
            if (typeof source === 'object') {
                var results = {};
                for (var alias in source) {
                    results[alias] = this.addSprites(alias, source[alias]);
                }
                return results;
            }
            // eslint-disable-next-line no-console
            console.assert(!this._sprites[source], "Alias ".concat(source, " is already taken"));
            var sprite = new SoundSprite(this, data);
            this._sprites[source] = sprite;
            return sprite;
        };
        Sound.prototype.duplicate = function () {
            var options = __assign({}, this.options);
            options.source = this.media.buffer;
            return new Sound(new WebAudioMedia(), options);
        };
        /** Destructor, safer to use `SoundLibrary.remove(alias)` to remove this sound. */
        Sound.prototype.destroy = function () {
            this._removeInstances();
            this.removeSprites();
            this.media.destroy();
            this.media = null;
            this._sprites = null;
            this._instances = null;
        };
        /**
         * Remove a sound sprite.
         * @param {String} alias - The unique name of the sound sprite, if alias is omitted, removes all sprites.
         * @return Sound instance for chaining.
         */
        Sound.prototype.removeSprites = function (alias) {
            if (!alias) {
                for (var name_1 in this._sprites) {
                    this.removeSprites(name_1);
                }
            }
            else {
                var sprite = this._sprites[alias];
                if (sprite !== undefined) {
                    sprite.destroy();
                    delete this._sprites[alias];
                }
            }
            return this;
        };
        Object.defineProperty(Sound.prototype, "isPlayable", {
            /** If the current sound is playable (loaded). */
            get: function () {
                return this.isLoaded && this.media && this.media.isPlayable;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Stops all the instances of this sound from playing.
         * @return Instance of this sound.
         */
        Sound.prototype.stop = function () {
            if (!this.isPlayable) {
                this.autoPlay = false;
                this._autoPlayOptions = null;
                return this;
            }
            this.isPlaying = false;
            // Go in reverse order so we don't skip items
            for (var i = this._instances.length - 1; i >= 0; i--) {
                this._instances[i].stop();
            }
            return this;
        };
        // Overloaded function
        Sound.prototype.play = function (source, complete) {
            var _this = this;
            var options;
            if (typeof source === 'string') {
                var sprite = source;
                options = { sprite: sprite, loop: this.loop, complete: complete };
            }
            else if (typeof source === 'function') {
                options = {};
                options.complete = source;
            }
            else {
                options = source;
            }
            options = __assign({ complete: null, loaded: null, sprite: null, end: null, start: 0, volume: 1, speed: 1, muted: false, loop: false }, (options || {}));
            // A sprite is specified, add the options
            if (options.sprite) {
                var alias = options.sprite;
                // eslint-disable-next-line no-console
                console.assert(!!this._sprites[alias], "Alias ".concat(alias, " is not available"));
                var sprite = this._sprites[alias];
                options.start = sprite.start + (options.start || 0);
                options.end = sprite.end;
                options.speed = sprite.speed || 1;
                options.loop = sprite.loop || options.loop;
                delete options.sprite;
            }
            // @deprecated offset option
            if (options.offset) {
                options.start = options.offset;
            }
            // if not yet playable, ignore
            // - usefull when the sound download isnt yet completed
            if (!this.isLoaded) {
                return new Promise(function (resolve, reject) {
                    _this.autoPlay = true;
                    _this._autoPlayOptions = options;
                    _this._preload(function (err, sound, media) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            if (options.loaded) {
                                options.loaded(err, sound, media);
                            }
                            resolve(media);
                        }
                    });
                });
            }
            // Stop all sounds
            if (this.singleInstance) {
                this._removeInstances();
            }
            // clone the bufferSource
            var instance = this._createInstance();
            this._instances.push(instance);
            this.isPlaying = true;
            instance.once('end', function () {
                if (options.complete) {
                    options.complete(_this);
                }
                _this._onComplete(instance);
            });
            instance.once('stop', function () {
                _this._onComplete(instance);
            });
            instance.play(options);
            return instance;
        };
        /** Internal only, speed, loop, volume change occured. */
        Sound.prototype.refresh = function () {
            var len = this._instances.length;
            for (var i = 0; i < len; i++) {
                this._instances[i].refresh();
            }
        };
        /** Handle changes in paused state. Internal only. */
        Sound.prototype.refreshPaused = function () {
            var len = this._instances.length;
            for (var i = 0; i < len; i++) {
                this._instances[i].refreshPaused();
            }
        };
        Object.defineProperty(Sound.prototype, "volume", {
            /** Gets and sets the volume. */
            get: function () {
                return this._volume;
            },
            set: function (volume) {
                this._volume = volume;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "muted", {
            /** Gets and sets the muted flag. */
            get: function () {
                return this._muted;
            },
            set: function (muted) {
                this._muted = muted;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "loop", {
            /** Gets and sets the looping. */
            get: function () {
                return this._loop;
            },
            set: function (loop) {
                this._loop = loop;
                this.refresh();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Starts the preloading of sound.
         * @private
         */
        Sound.prototype._preload = function (callback) {
            this.media.load(callback);
        };
        Object.defineProperty(Sound.prototype, "instances", {
            /**
             * Gets the list of instances that are currently being played of this sound.
             * @type {Array<WebAudioInstance>}
             */
            get: function () {
                return this._instances;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "sprites", {
            /**
             * Get the map of sprites.
             * @type {Object}
             */
            get: function () {
                return this._sprites;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "duration", {
            /** Get the duration of the audio in seconds. */
            get: function () {
                return this.media.duration;
            },
            enumerable: false,
            configurable: true
        });
        /** Auto play the first instance. */
        Sound.prototype.autoPlayStart = function () {
            var instance;
            if (this.autoPlay) {
                instance = this.play(this._autoPlayOptions);
            }
            return instance;
        };
        /**
         * Removes all instances.
         * @private
         */
        Sound.prototype._removeInstances = function () {
            // destroying also stops
            for (var i = this._instances.length - 1; i >= 0; i--) {
                this._poolInstance(this._instances[i]);
            }
            this._instances.length = 0;
        };
        /**
         * Sound instance completed.
         * @private
         * @param {WebAudioInstance} instance
         */
        Sound.prototype._onComplete = function (instance) {
            if (this._instances) {
                var index = this._instances.indexOf(instance);
                if (index > -1) {
                    this._instances.splice(index, 1);
                }
                this.isPlaying = this._instances.length > 0;
            }
            this._poolInstance(instance);
        };
        /**
         * Create a new instance.
         * @private
         * @return New instance to use
         */
        Sound.prototype._createInstance = function () {
            if (Sound._pool.length > 0) {
                var instance = Sound._pool.pop();
                instance.init(this.media);
                return instance;
            }
            return this.media.create();
        };
        /**
         * Destroy/recycling the instance object.
         * @private
         * @param instance - - Instance to recycle
         */
        Sound.prototype._poolInstance = function (instance) {
            instance.destroy();
            // Add it if it isn't already added
            if (Sound._pool.indexOf(instance) < 0) {
                Sound._pool.push(instance);
            }
        };
        /**
         * Pool of instances
         * @type {Array<WebAudioInstance>}
         */
        Sound._pool = [];
        return Sound;
    }());

    /**
     * Increment the alias for play once
     * @static
     * @default 0
     */
    var PLAY_ID = 0;
    /**
     * Manages the playback of sounds. This is the main class for PixiJS Sound. If you're
     * using the browser-based bundled this is `PIXI.sound`. Otherwise, you can do this:
     * @example
     * import { sound } from '@pixi/sound';
     *
     * // sound is an instance of SoundLibrary
     * sound.add('my-sound', 'path/to/file.mp3');
     * sound.play('my-sound');
     * @class
     */
    var SoundLibrary = /** @class */ (function () {
        function SoundLibrary() {
            this.init();
        }
        /**
         * Re-initialize the sound library, this will
         * recreate the AudioContext. If there's a hardware-failure
         * call `close` and then `init`.
         * @return Sound instance
         */
        SoundLibrary.prototype.init = function () {
            this._context = new WebAudioContext();
            this._sounds = {};
            return this;
        };
        Object.defineProperty(SoundLibrary.prototype, "context", {
            /**
             * The global context to use.
             * @type {WebAudioContext}
             * @readonly
             */
            get: function () {
                return this._context;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SoundLibrary.prototype, "filtersAll", {
            /**
             * Apply filters to all sounds. Can be useful
             * for setting global planning or global effects.
             * **Only supported with WebAudio.**
             * @example
             * import { sound, filters } from '@pixi/sound';
             * // Adds a filter to pan all output left
             * sound.filtersAll = [
             *     new filters.StereoFilter(-1)
             * ];
             * @type {filters.Filter[]}
             */
            get: function () {
                return this._context.filters;
            },
            set: function (filtersAll) {
                this._context.filters = filtersAll;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SoundLibrary.prototype, "supported", {
            /**
             * `true` if WebAudio is supported on the current browser.
             * @readonly
             * @type {boolean}
             */
            get: function () {
                return WebAudioContext.AudioContext !== null;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @ignore
         */
        SoundLibrary.prototype.add = function (source, sourceOptions) {
            if (typeof source === 'object') {
                var results = {};
                for (var alias in source) {
                    var options_1 = this._getOptions(source[alias], sourceOptions);
                    results[alias] = this.add(alias, options_1);
                }
                return results;
            }
            // eslint-disable-next-line no-console
            console.assert(!this._sounds[source], "Sound with alias ".concat(source, " already exists."));
            if (sourceOptions instanceof Sound) {
                this._sounds[source] = sourceOptions;
                return sourceOptions;
            }
            var options = this._getOptions(sourceOptions, {
                context: this.context,
            });
            var sound = Sound.from(options);
            this._sounds[source] = sound;
            return sound;
        };
        /**
         * Internal methods for getting the options object
         * @private
         * @param source - The source options
         * @param overrides - Override default options
         * @return The construction options
         */
        SoundLibrary.prototype._getOptions = function (source, overrides) {
            var options;
            if (typeof source === 'string') {
                options = { url: source };
            }
            else if (source instanceof ArrayBuffer || source instanceof HTMLAudioElement) {
                options = { source: source };
            }
            else {
                options = source;
            }
            options = __assign(__assign({}, options), (overrides || {}));
            return options;
        };
        /**
         * Removes a sound by alias.
         * @param alias - The sound alias reference.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.remove = function (alias) {
            this.exists(alias, true);
            this._sounds[alias].destroy();
            delete this._sounds[alias];
            return this;
        };
        Object.defineProperty(SoundLibrary.prototype, "volumeAll", {
            /**
             * Set the global volume for all sounds. To set per-sound volume see {@link SoundLibrary#volume}.
             * @type {number}
             */
            get: function () {
                return this._context.volume;
            },
            set: function (volume) {
                this._context.volume = volume;
                this._context.refresh();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SoundLibrary.prototype, "speedAll", {
            /**
             * Set the global speed for all sounds. To set per-sound speed see {@link SoundLibrary#speed}.
             * @type {number}
             */
            get: function () {
                return this._context.speed;
            },
            set: function (speed) {
                this._context.speed = speed;
                this._context.refresh();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Toggle paused property for all sounds.
         * @return `true` if all sounds are paused.
         */
        SoundLibrary.prototype.togglePauseAll = function () {
            return this._context.togglePause();
        };
        /**
         * Pauses any playing sounds.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.pauseAll = function () {
            this._context.paused = true;
            this._context.refreshPaused();
            return this;
        };
        /**
         * Resumes any sounds.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.resumeAll = function () {
            this._context.paused = false;
            this._context.refreshPaused();
            return this;
        };
        /**
         * Toggle muted property for all sounds.
         * @return `true` if all sounds are muted.
         */
        SoundLibrary.prototype.toggleMuteAll = function () {
            return this._context.toggleMute();
        };
        /**
         * Mutes all playing sounds.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.muteAll = function () {
            this._context.muted = true;
            this._context.refresh();
            return this;
        };
        /**
         * Unmutes all playing sounds.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.unmuteAll = function () {
            this._context.muted = false;
            this._context.refresh();
            return this;
        };
        /**
         * Stops and removes all sounds. They cannot be used after this.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.removeAll = function () {
            for (var alias in this._sounds) {
                this._sounds[alias].destroy();
                delete this._sounds[alias];
            }
            return this;
        };
        /**
         * Stops all sounds.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.stopAll = function () {
            for (var alias in this._sounds) {
                this._sounds[alias].stop();
            }
            return this;
        };
        /**
         * Checks if a sound by alias exists.
         * @param alias - Check for alias.
         * @param assert - Whether enable console.assert.
         * @return true if the sound exists.
         */
        SoundLibrary.prototype.exists = function (alias, assert) {
            if (assert === void 0) { assert = false; }
            var exists = !!this._sounds[alias];
            if (assert) {
                // eslint-disable-next-line no-console
                console.assert(exists, "No sound matching alias '".concat(alias, "'."));
            }
            return exists;
        };
        /**
         * Find a sound by alias.
         * @param alias - The sound alias reference.
         * @return Sound object.
         */
        SoundLibrary.prototype.find = function (alias) {
            this.exists(alias, true);
            return this._sounds[alias];
        };
        /**
         * Plays a sound.
         * @method play
         * @instance
         * @param {string} alias - The sound alias reference.
         * @param {string} sprite - The alias of the sprite to play.
         * @return {WebAudioInstance|null} The sound instance, this cannot be reused
         *         after it is done playing. Returns `null` if the sound has not yet loaded.
         */
        /**
         * Plays a sound.
         * @param alias - The sound alias reference.
         * @param {PlayOptions|Function} options - The options or callback when done.
         * @return The sound instance,
         *        this cannot be reused after it is done playing. Returns a Promise if the sound
         *        has not yet loaded.
         */
        SoundLibrary.prototype.play = function (alias, options) {
            return this.find(alias).play(options);
        };
        /**
         * Stops a sound.
         * @param alias - The sound alias reference.
         * @return Sound object.
         */
        SoundLibrary.prototype.stop = function (alias) {
            return this.find(alias).stop();
        };
        /**
         * Pauses a sound.
         * @param alias - The sound alias reference.
         * @return Sound object.
         */
        SoundLibrary.prototype.pause = function (alias) {
            return this.find(alias).pause();
        };
        /**
         * Resumes a sound.
         * @param alias - The sound alias reference.
         * @return Instance for chaining.
         */
        SoundLibrary.prototype.resume = function (alias) {
            return this.find(alias).resume();
        };
        /**
         * Get or set the volume for a sound.
         * @param alias - The sound alias reference.
         * @param volume - Optional current volume to set.
         * @return The current volume.
         */
        SoundLibrary.prototype.volume = function (alias, volume) {
            var sound = this.find(alias);
            if (volume !== undefined) {
                sound.volume = volume;
            }
            return sound.volume;
        };
        /**
         * Get or set the speed for a sound.
         * @param alias - The sound alias reference.
         * @param speed - Optional current speed to set.
         * @return The current speed.
         */
        SoundLibrary.prototype.speed = function (alias, speed) {
            var sound = this.find(alias);
            if (speed !== undefined) {
                sound.speed = speed;
            }
            return sound.speed;
        };
        /**
         * Get the length of a sound in seconds.
         * @param alias - The sound alias reference.
         * @return The current duration in seconds.
         */
        SoundLibrary.prototype.duration = function (alias) {
            return this.find(alias).duration;
        };
        /**
         * Closes the sound library. This will release/destroy
         * the AudioContext(s). Can be used safely if you want to
         * initialize the sound library later. Use `init` method.
         */
        SoundLibrary.prototype.close = function () {
            this.removeAll();
            this._sounds = null;
            this._context.destroy();
            this._context = null;
            return this;
        };
        SoundLibrary.prototype.playOnce = function (url, callback) {
            var _this = this;
            var alias = "alias".concat(PLAY_ID++);
            this.add(alias, {
                url: url,
                preload: true,
                autoPlay: true,
                loaded: function (err) {
                    if (err) {
                        console.error(err);
                        _this.remove(alias);
                        if (callback) {
                            callback(err);
                        }
                    }
                },
                complete: function () {
                    _this.remove(alias);
                    if (callback) {
                        callback(null);
                    }
                },
            });
            return alias;
        };
        return SoundLibrary;
    }());

    var sound = new SoundLibrary();

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
    function render(sound, options) {
        var canvas = document.createElement('canvas');
        options = __assign({ width: 512, height: 128, fill: 'black' }, (options || {}));
        canvas.width = options.width;
        canvas.height = options.height;
        var baseTexture = core.BaseTexture.from(canvas);
        if (!(sound.media instanceof WebAudioMedia)) {
            return baseTexture;
        }
        var media = sound.media;
        // eslint-disable-next-line no-console
        console.assert(!!media.buffer, 'No buffer found, load first');
        var context = canvas.getContext('2d');
        context.fillStyle = options.fill;
        var data = media.buffer.getChannelData(0);
        var step = Math.ceil(data.length / options.width);
        var amp = options.height / 2;
        for (var i = 0; i < options.width; i++) {
            var min = 1.0;
            var max = -1.0;
            for (var j = 0; j < step; j++) {
                var datum = data[(i * step) + j];
                if (datum < min) {
                    min = datum;
                }
                if (datum > max) {
                    max = datum;
                }
            }
            context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
        return baseTexture;
    }

    /**
     * Create a new sound for a sine wave-based tone.  **Only supported with WebAudio**
     * @static
     * @param {number} [hertz=200] - Frequency of sound.
     * @param {number} [seconds=1] - Duration of sound in seconds.
     * @return New sound.
     */
    function sineTone(hertz, seconds) {
        if (hertz === void 0) { hertz = 200; }
        if (seconds === void 0) { seconds = 1; }
        var sound = Sound.from({
            singleInstance: true,
        });
        if (!(sound.media instanceof WebAudioMedia)) {
            return sound;
        }
        var media = sound.media;
        var context = sound.context;
        // set default value
        var nChannels = 1;
        var sampleRate = 48000;
        var amplitude = 2;
        // create the buffer
        var buffer = context.audioContext.createBuffer(nChannels, seconds * sampleRate, sampleRate);
        var fArray = buffer.getChannelData(0);
        // fill the buffer
        for (var i = 0; i < fArray.length; i++) {
            var time = i / buffer.sampleRate;
            var angle = hertz * time * Math.PI;
            fArray[i] = Math.sin(angle) * amplitude;
        }
        // set the buffer
        media.buffer = buffer;
        sound.isLoaded = true;
        return sound;
    }

    var utils = {
        __proto__: null,
        render: render,
        resolveUrl: resolveUrl,
        sineTone: sineTone,
        validateFormats: validateFormats,
        supported: supported,
        extensions: extensions
    };

    /**
     * Sound middleware installation utilities for PIXI.Loader
     * @class
     */
    var SoundLoader = /** @class */ (function () {
        function SoundLoader() {
        }
        /** Install the middleware */
        SoundLoader.add = function () {
            // Configure PIXI Loader to handle audio files correctly
            // Load all audio files as ArrayBuffers
            extensions.forEach(function (ext) {
                loaders.LoaderResource.setExtensionXhrType(ext, loaders.LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
                loaders.LoaderResource.setExtensionLoadType(ext, loaders.LoaderResource.LOAD_TYPE.XHR);
            });
        };
        /** Handle the preprocessing of file paths */
        SoundLoader.pre = function (resource, next) {
            resolveUrl(resource);
            next();
        };
        /** Actual resource-loader middleware for sound class */
        SoundLoader.use = function (resource, next) {
            if (resource.data && extensions.indexOf(resource.extension) > -1) {
                resource.sound = sound.add(resource.name, {
                    loaded: next,
                    preload: true,
                    url: resource.url,
                    source: resource.data,
                });
            }
            else {
                next();
            }
        };
        return SoundLoader;
    }());

    var Filter = /** @class */ (function () {
        function Filter() {
            this._context = null;
        }
        /** Reinitialize */
        Filter.prototype.init = function (destination, source) {
            this.destination = destination;
            this.source = source || destination;
        };
        Object.defineProperty(Filter.prototype, "context", {
            get: function () {
                return this._context;
            },
            set: function (context) {
                if (this._context) {
                    // eslint-disable-next-line no-console
                    console.assert(this._context === context, 'AudioContext already bound to this filter');
                    return;
                }
                this._context = context;
                this.setup();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Connect to the destination.
         * @param {AudioNode} destination - The destination node to connect the output to
         */
        Filter.prototype.connect = function (destination) {
            this.source.connect(destination);
        };
        /** Completely disconnect filter from destination and source nodes. */
        Filter.prototype.disconnect = function () {
            this.source.disconnect();
        };
        /** Destroy the filter and don't use after this. */
        Filter.prototype.destroy = function () {
            this.disconnect();
            this.destination = null;
            this.source = null;
        };
        return Filter;
    }());

    /**
     * Filter for adding equalizer bands.
     *
     * @class
     * @memberof filters
     * @param {number} [f32=0] - Default gain for 32 Hz
     * @param {number} [f64=0] - Default gain for 64 Hz
     * @param {number} [f125=0] - Default gain for 125 Hz
     * @param {number} [f250=0] - Default gain for 250 Hz
     * @param {number} [f500=0] - Default gain for 500 Hz
     * @param {number} [f1k=0] - Default gain for 1000 Hz
     * @param {number} [f2k=0] - Default gain for 2000 Hz
     * @param {number} [f4k=0] - Default gain for 4000 Hz
     * @param {number} [f8k=0] - Default gain for 8000 Hz
     * @param {number} [f16k=0] - Default gain for 16000 Hz
     */
    var EqualizerFilter = /** @class */ (function (_super) {
        __extends(EqualizerFilter, _super);
        /**
         * @param {EqualizerOptions} options - the equalizer options
         */
        function EqualizerFilter(options) {
            var _this = _super.call(this) || this;
            _this.options = __assign({ f32: 0, f64: 0, f125: 0, f250: 0, f500: 0, f1k: 0, f2k: 0, f4k: 0, f8k: 0, f16k: 0 }, options);
            return _this;
        }
        /**
         * Set gain on a specific frequency.
         * @param {number} frequency - The frequency, see EqualizerFilter.F* for bands
         * @param {number} [gain=0] - Recommended -40 to 40.
         */
        EqualizerFilter.prototype.setGain = function (frequency, gain) {
            if (gain === void 0) { gain = 0; }
            if (!this.bandsMap[frequency]) {
                throw new Error("No band found for frequency ".concat(frequency));
            }
            this.context.setParamValue(this.bandsMap[frequency].gain, gain);
        };
        /**
         * Get gain amount on a specific frequency.
         * @return The amount of gain set.
         */
        EqualizerFilter.prototype.getGain = function (frequency) {
            if (!this.bandsMap[frequency]) {
                throw new Error("No band found for frequency ".concat(frequency));
            }
            return this.bandsMap[frequency].gain.value;
        };
        Object.defineProperty(EqualizerFilter.prototype, "f32", {
            get: function () {
                return this.getGain(EqualizerFilter.F32);
            },
            /**
             * Gain at 32 Hz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F32, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f64", {
            get: function () {
                return this.getGain(EqualizerFilter.F64);
            },
            /**
             * Gain at 64 Hz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F64, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f125", {
            get: function () {
                return this.getGain(EqualizerFilter.F125);
            },
            /**
             * Gain at 125 Hz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F125, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f250", {
            get: function () {
                return this.getGain(EqualizerFilter.F250);
            },
            /**
             * Gain at 250 Hz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F250, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f500", {
            get: function () {
                return this.getGain(EqualizerFilter.F500);
            },
            /**
             * Gain at 500 Hz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F500, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f1k", {
            get: function () {
                return this.getGain(EqualizerFilter.F1K);
            },
            /**
             * Gain at 1 KHz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F1K, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f2k", {
            get: function () {
                return this.getGain(EqualizerFilter.F2K);
            },
            /**
             * Gain at 2 KHz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F2K, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f4k", {
            get: function () {
                return this.getGain(EqualizerFilter.F4K);
            },
            /**
             * Gain at 4 KHz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F4K, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f8k", {
            get: function () {
                return this.getGain(EqualizerFilter.F8K);
            },
            /**
             * Gain at 8 KHz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F8K, value);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "f16k", {
            get: function () {
                return this.getGain(EqualizerFilter.F16K);
            },
            /**
             * Gain at 16 KHz frequencey.
             * @type {number}
             * @default 0
             */
            set: function (value) {
                this.setGain(EqualizerFilter.F16K, value);
            },
            enumerable: false,
            configurable: true
        });
        /** Reset all frequency bands to have gain of 0 */
        EqualizerFilter.prototype.reset = function () {
            var _this = this;
            this.bands.forEach(function (band) {
                _this.context.setParamValue(band.gain, 0);
            });
        };
        EqualizerFilter.prototype.destroy = function () {
            this.bands.forEach(function (band) {
                band.disconnect();
            });
            this._bands = null;
            this._bandsMap = null;
        };
        Object.defineProperty(EqualizerFilter.prototype, "bands", {
            get: function () {
                return this._bands;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(EqualizerFilter.prototype, "bandsMap", {
            get: function () {
                return this._bandsMap;
            },
            enumerable: false,
            configurable: true
        });
        EqualizerFilter.prototype.setup = function () {
            var equalizerBands = [
                {
                    f: EqualizerFilter.F32,
                    type: 'lowshelf',
                    gain: this.options.f32,
                },
                {
                    f: EqualizerFilter.F64,
                    type: 'peaking',
                    gain: this.options.f64,
                },
                {
                    f: EqualizerFilter.F125,
                    type: 'peaking',
                    gain: this.options.f125,
                },
                {
                    f: EqualizerFilter.F250,
                    type: 'peaking',
                    gain: this.options.f250,
                },
                {
                    f: EqualizerFilter.F500,
                    type: 'peaking',
                    gain: this.options.f500,
                },
                {
                    f: EqualizerFilter.F1K,
                    type: 'peaking',
                    gain: this.options.f1k,
                },
                {
                    f: EqualizerFilter.F2K,
                    type: 'peaking',
                    gain: this.options.f2k,
                },
                {
                    f: EqualizerFilter.F4K,
                    type: 'peaking',
                    gain: this.options.f4k,
                },
                {
                    f: EqualizerFilter.F8K,
                    type: 'peaking',
                    gain: this.options.f8k,
                },
                {
                    f: EqualizerFilter.F16K,
                    type: 'highshelf',
                    gain: this.options.f16k,
                },
            ];
            var context = this.context;
            var bands = equalizerBands.map(function (band) {
                var node = context.audioContext.createBiquadFilter();
                node.type = band.type;
                context.setParamValue(node.Q, 1);
                node.frequency.value = band.f; // WebAudioUtils.setParamValue(filter.frequency, band.f);
                context.setParamValue(node.gain, band.gain);
                return node;
            });
            // Setup the constructor AudioNode, where first is the input, and last is the output
            this.init(bands[0], bands[bands.length - 1]);
            // Manipulate the bands
            this._bands = bands;
            // Create a map
            this._bandsMap = {};
            for (var i = 0; i < this._bands.length; i++) {
                var node = this._bands[i];
                // Connect the previous band to the current one
                if (i > 0) {
                    this._bands[i - 1].connect(node);
                }
                this._bandsMap[node.frequency.value] = node;
            }
        };
        /**
         * Band at 32 Hz
         * @readonly
         */
        EqualizerFilter.F32 = 32;
        /**
         * Band at 64 Hz
         * @readonly
         */
        EqualizerFilter.F64 = 64;
        /**
         * Band at 125 Hz
         * @readonly
         */
        EqualizerFilter.F125 = 125;
        /**
         * Band at 250 Hz
         * @readonly
         */
        EqualizerFilter.F250 = 250;
        /**
         * Band at 500 Hz
         * @readonly
         */
        EqualizerFilter.F500 = 500;
        /**
         * Band at 1000 Hz
         * @readonly
         */
        EqualizerFilter.F1K = 1000;
        /**
         * Band at 2000 Hz
         * @readonly
         */
        EqualizerFilter.F2K = 2000;
        /**
         * Band at 4000 Hz
         * @readonly
         */
        EqualizerFilter.F4K = 4000;
        /**
         * Band at 8000 Hz
         * @readonly
         */
        EqualizerFilter.F8K = 8000;
        /**
         * Band at 16000 Hz
         * @readonly
         */
        EqualizerFilter.F16K = 16000;
        return EqualizerFilter;
    }(Filter));

    /**
     * Filter for adding adding delaynode.
     *
     * @class
     * @memberof filters
     */
    var DistortionFilter = /** @class */ (function (_super) {
        __extends(DistortionFilter, _super);
        /**
         * @param {number} [amount=0] - The amount of distoration from 0 to 1.
         */
        function DistortionFilter(amount) {
            if (amount === void 0) { amount = 0; }
            var _this = _super.call(this) || this;
            _this._amount = amount;
            return _this;
        }
        DistortionFilter.prototype.setup = function () {
            var distortion = this.context.audioContext.createWaveShaper();
            this.init(distortion);
            this._distortion = distortion;
            this.amount = this._amount;
        };
        Object.defineProperty(DistortionFilter.prototype, "amount", {
            get: function () {
                return this._amount;
            },
            /** @type {number} */
            set: function (amount) {
                this._amount = amount;
                if (!this.context) {
                    // will take effect after the context is ready
                    return;
                }
                var value = amount * 1000;
                var samples = 44100;
                var curve = new Float32Array(samples);
                var deg = Math.PI / 180;
                var i = 0;
                var x;
                for (; i < samples; ++i) {
                    x = (i * 2 / samples) - 1;
                    curve[i] = (3 + value) * x * 20 * deg / (Math.PI + (value * Math.abs(x)));
                }
                this._distortion.curve = curve;
                this._distortion.oversample = '4x';
            },
            enumerable: false,
            configurable: true
        });
        DistortionFilter.prototype.destroy = function () {
            this._distortion = null;
            _super.prototype.destroy.call(this);
        };
        return DistortionFilter;
    }(Filter));

    /**
     * Filter for adding Stereo panning.
     *
     * @class
     * @memberof filters
     */
    var StereoFilter = /** @class */ (function (_super) {
        __extends(StereoFilter, _super);
        /**
         * @param {number} pan - The amount of panning, -1 is left, 1 is right, 0 is centered.
         */
        function StereoFilter(pan) {
            if (pan === void 0) { pan = 0; }
            var _this = _super.call(this) || this;
            _this._pan = pan;
            return _this;
        }
        Object.defineProperty(StereoFilter.prototype, "pan", {
            get: function () {
                return this._pan;
            },
            /** Set the amount of panning, where -1 is left, 1 is right, and 0 is centered */
            set: function (value) {
                this._pan = value;
                if (!this.context) {
                    return;
                }
                if (this._stereo) {
                    this.context.setParamValue(this._stereo.pan, value);
                }
                else {
                    this._panner.setPosition(value, 0, 1 - Math.abs(value));
                }
            },
            enumerable: false,
            configurable: true
        });
        StereoFilter.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._stereo = null;
            this._panner = null;
        };
        StereoFilter.prototype.setup = function () {
            var stereo;
            var panner;
            var destination;
            var audioContext = this.context.audioContext;
            if (audioContext.createStereoPanner) {
                stereo = audioContext.createStereoPanner();
                destination = stereo;
            }
            else {
                panner = audioContext.createPanner();
                panner.panningModel = 'equalpower';
                destination = panner;
            }
            this.init(destination);
            this._stereo = stereo;
            this._panner = panner;
            this.pan = this._pan;
        };
        return StereoFilter;
    }(Filter));

    /**
     * Filter for adding reverb. Refactored from
     * https://github.com/web-audio-components/simple-reverb/
     *
     * @class
     * @memberof filters
     */
    var ReverbFilter = /** @class */ (function (_super) {
        __extends(ReverbFilter, _super);
        /**
         * @param seconds - Seconds for reverb
         * @param decay - The decay length
         * @param reverse - Reverse reverb
         */
        function ReverbFilter(seconds, decay, reverse) {
            if (seconds === void 0) { seconds = 3; }
            if (decay === void 0) { decay = 2; }
            if (reverse === void 0) { reverse = false; }
            var _this = _super.call(this) || this;
            _this._seconds = _this._clamp(seconds, 1, 50);
            _this._decay = _this._clamp(decay, 0, 100);
            _this._reverse = reverse;
            return _this;
        }
        /**
         * Clamp a value
         * @param {number} value
         * @param {number} min - Minimum value
         * @param {number} max - Maximum value
         * @return Clamped number
         */
        ReverbFilter.prototype._clamp = function (value, min, max) {
            return Math.min(max, Math.max(min, value));
        };
        Object.defineProperty(ReverbFilter.prototype, "seconds", {
            /**
             * Length of reverb in seconds from 1 to 50
             * @default 3
             */
            get: function () {
                return this._seconds;
            },
            set: function (seconds) {
                this._seconds = this._clamp(seconds, 1, 50);
                this._rebuild();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ReverbFilter.prototype, "decay", {
            /**
             * Decay value from 0 to 100
             * @default 2
             */
            get: function () {
                return this._decay;
            },
            set: function (decay) {
                this._decay = this._clamp(decay, 0, 100);
                this._rebuild();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ReverbFilter.prototype, "reverse", {
            /**
             * Reverse value from 0 to 1
             * @default false
             */
            get: function () {
                return this._reverse;
            },
            set: function (reverse) {
                this._reverse = reverse;
                this._rebuild();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Utility function for building an impulse response
         * from the module parameters.
         */
        ReverbFilter.prototype._rebuild = function () {
            if (!this.context) {
                return;
            }
            var context = this.context.audioContext;
            var rate = context.sampleRate;
            var length = rate * this._seconds;
            var impulse = context.createBuffer(2, length, rate);
            var impulseL = impulse.getChannelData(0);
            var impulseR = impulse.getChannelData(1);
            var n;
            for (var i = 0; i < length; i++) {
                n = this._reverse ? length - i : i;
                impulseL[i] = ((Math.random() * 2) - 1) * Math.pow(1 - (n / length), this._decay);
                impulseR[i] = ((Math.random() * 2) - 1) * Math.pow(1 - (n / length), this._decay);
            }
            var convolver = this.context.audioContext.createConvolver();
            convolver.buffer = impulse;
            this.init(convolver);
        };
        ReverbFilter.prototype.setup = function () {
            this._rebuild();
        };
        return ReverbFilter;
    }(Filter));

    /**
     * Combine all channels into mono channel.
     *
     * @class
     * @memberof filters
     */
    var MonoFilter = /** @class */ (function (_super) {
        __extends(MonoFilter, _super);
        function MonoFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MonoFilter.prototype.destroy = function () {
            this._merger.disconnect();
            this._merger = null;
            _super.prototype.destroy.call(this);
        };
        MonoFilter.prototype.setup = function () {
            var audioContext = this.context.audioContext;
            var splitter = audioContext.createChannelSplitter();
            var merger = audioContext.createChannelMerger();
            merger.connect(splitter);
            this.init(merger, splitter);
            this._merger = merger;
        };
        return MonoFilter;
    }(Filter));

    /**
     * This filter does nothing to audio
     * but exports a MediaStream of the audio context
     * @class
     * @memberof filters
     */
    var StreamFilter = /** @class */ (function (_super) {
        __extends(StreamFilter, _super);
        function StreamFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(StreamFilter.prototype, "stream", {
            get: function () {
                return this._stream;
            },
            enumerable: false,
            configurable: true
        });
        StreamFilter.prototype.destroy = function () {
            this._stream = null;
            _super.prototype.destroy.call(this);
        };
        StreamFilter.prototype.setup = function () {
            var audioContext = this.context.audioContext;
            var destination = audioContext.createMediaStreamDestination();
            var source = audioContext.createMediaStreamSource(destination.stream);
            this.init(destination, source);
            this._stream = destination.stream;
        };
        return StreamFilter;
    }(Filter));

    /**
     * Creates a telephone-sound filter.
     *
     * @class
     * @memberof filters
     */
    var TelephoneFilter = /** @class */ (function (_super) {
        __extends(TelephoneFilter, _super);
        function TelephoneFilter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TelephoneFilter.prototype.setup = function () {
            var audioContext = this.context.audioContext;
            var lpf1 = audioContext.createBiquadFilter();
            var lpf2 = audioContext.createBiquadFilter();
            var hpf1 = audioContext.createBiquadFilter();
            var hpf2 = audioContext.createBiquadFilter();
            lpf1.type = 'lowpass';
            this.context.setParamValue(lpf1.frequency, 2000.0);
            lpf2.type = 'lowpass';
            this.context.setParamValue(lpf2.frequency, 2000.0);
            hpf1.type = 'highpass';
            this.context.setParamValue(hpf1.frequency, 500.0);
            hpf2.type = 'highpass';
            this.context.setParamValue(hpf2.frequency, 500.0);
            lpf1.connect(lpf2);
            lpf2.connect(hpf1);
            hpf1.connect(hpf2);
            this.init(lpf1, hpf2);
        };
        return TelephoneFilter;
    }(Filter));

    /**
     * Set of dynamic filters to be applied to Sound.
     * @example
     * import { Sound, filters } from '@pixi/sound';
     * const sound = Sound.from('file.mp3');
     * sound.filters = [
     *   new filters.StereoFilter(-1),
     *   new filters.ReverbFilter()
     * ];
     * @namespace filters
     */

    var filters = {
        __proto__: null,
        Filter: Filter,
        EqualizerFilter: EqualizerFilter,
        DistortionFilter: DistortionFilter,
        StereoFilter: StereoFilter,
        ReverbFilter: ReverbFilter,
        MonoFilter: MonoFilter,
        StreamFilter: StreamFilter,
        TelephoneFilter: TelephoneFilter
    };

    // Add the loader plugin
    loaders.Loader.registerPlugin(SoundLoader);

    Object.defineProperties(sound, {
        Filterable: { get: function () { return Filterable; } },
        filters: { get: function () { return filters; } },
        Sound: { get: function () { return Sound; } },
        SoundLoader: { get: function () { return SoundLoader; } },
        SoundLibrary: { get: function () { return SoundLibrary; } },
        SoundSprite: { get: function () { return SoundSprite; } },
        utils: { get: function () { return utils; } },
        sound: { get: function () { return sound; } },
    });

    return sound;

})(PIXI, PIXI, PIXI.utils, PIXI);
//# sourceMappingURL=pixi-sound.js.map
