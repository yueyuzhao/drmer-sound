import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import pkg from "../package.json";

const plugins = [typescript()];

// Disabling minification makes faster
// watch and better coverage debugging
if (process.env.NODE_ENV === "production") {
    plugins.push(terser({
        output: {
            comments(node, comment) {
                return comment.line === 1;
            },
        },
        compress: {
            drop_console: true,
        },
    }));
}

const sourcemap = true;
const external = Object.keys(pkg.peerDependencies);
const compiled = (new Date()).toUTCString().replace(/GMT/g, "UTC");
const banner = `/*!
 * ${pkg.name} - v${pkg.version}
 * https://git.drmer.net/drmer/sound
 * Compiled ${compiled}
 *
 * ${pkg.name} is licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license
 */`;

/**
 * This configuration is designed for building the browser version
 * of the library, ideally included using the <script> element
 */
export default [
    {
        input: "src/index.ts",
        external,
        plugins,
        output: [
            {
                banner,
                freeze: false,
                sourcemap,
                format: "cjs",
                file: "dist/drmer-sound.cjs.js",
            },
            {
                banner,
                freeze: false,
                sourcemap,
                format: "esm",
                file: "dist/drmer-sound.esm.js",
            },
        ],
    },
    {
        input: "src/browser.ts",
        external,
        plugins,
        output: {
            banner,
            freeze: false,
            format: "iife",
            name: "PIXI.sound",
            exports: 'default',
            sourcemap,
            file: "dist/drmer-sound.js",
            globals: {
                "@pixi/loaders": "PIXI",
                "@pixi/core": "PIXI",
                "@pixi/ticker": "PIXI",
                "@pixi/utils": "PIXI.utils",
            },
        }
    }
];
