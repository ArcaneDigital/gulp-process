/**
 * Gulp and Node dependencies
 */
const { src, dest, series, parallel, lastRun, task, watch } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');

/**
 * Stylesheet task related dependencies
 */
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoPrefixer = require('autoprefixer');
const cssNano = require('cssnano');

/**
 * Javascript task related dependencies
 */
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const glob = require('glob');
const merge = require('merge-stream');
const builtIns = require('rollup-plugin-node-builtins');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
// const { uglify } = require('rollup-plugin-uglify');

/**
 * Image task related dependencies
 */
const imagemin = require('gulp-imagemin');
const jpegOptim = require('imagemin-jpegoptim');

/**
 * Notification task related dependencies
 */
const notifier = require('node-notifier');

/**
 * Sets the current environment
 *
 * @type {string | string}
 */
const env = process.env.NODE_ENV || 'production';

/**
 * Defines empty object for configuration later
 *
 * @type {Object}
 */
const global = {};

/**
 * Accepts options to define to global variables
 *
 * @param options - configuration options
 * @returns void
 */
const config = options => {
    global.src = options.source;
    global.out = options.destination;
};

/**
 * Remove the string 'public' if it exists in the destination string
 *
 * @param string
 * @returns {string}
 */
const removePublicFolder = string => string.replace('public/', '');

/**
 * Notification task for when there is an issue at runtime
 *
 * @param task
 * @param err
 * @returns void
 */
const notification = (task, err) => {
    if (err) {
        notifier.notify({
            title: `ERROR: ${task}`,
            message: `There was an error within ${task}`,
        });
        console.log(err);
    }
};

/**
 * Stylesheet processing task
 *
 * @return {event}
 */
const styles = () => {
    const processors = [autoPrefixer];

    if (env === 'production') {
        processors.push(cssNano({ discardUnused: { fontFace: false } }));
    }

    let stream = src(global.src.style, {
        allowEmpty: true,
    });

    if (env !== 'production') {
        stream = stream.pipe(sourcemaps.init());
    }

    stream = stream
        .pipe(sassGlob())
        .pipe(sass({ includePaths: ['./node_modules/**/'] }))
        .on('error', err => {
            notification('styles', err);
        })
        .pipe(postcss(processors));

    if (env !== 'production') {
        stream = stream.pipe(
            sourcemaps.write('.', {
                sourceMappingURLPrefix: removePublicFolder(global.out.style),
            }),
        );
    }

    return stream.pipe(dest(global.out.style));
};
task('styles', styles);

/**
 * Javascript processing task
 *
 * @return {event}
 */
const scripts = () => {
    const stream = merge(
        glob.sync(`${global.src.script}/*.js`).map(input =>
            rollup({
                input,
                format: 'umd',
                plugins: [
                    builtIns(),
                    resolve(),
                    commonjs(),
                    babel({
                        presets: ['@babel/env'],
                        babelrc: false,
                    }),
                ],
                sourcemap: env !== 'production',
            })
                .pipe(
                    source(
                        path.resolve(input),
                        path.resolve(global.src.script),
                    ),
                )
                .pipe(buffer())
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(
                    sourcemaps.write('.', {
                        sourceMappingURLPrefix: removePublicFolder(
                            global.out.script,
                        ),
                    }),
                )
                .pipe(dest(global.out.script)),
        ),
    );

    return stream;
};
task('scripts', scripts);

/**
 * Image processing
 *
 * @return {event}
 */
const images = () => {
    let stream = src(global.src.image, {
        allowEmpty: true,
    });

    if (env === 'production') {
        stream = stream.pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.optipng({ optimzationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        {
                            cleanupIDs: false,
                            removeEmptyAttrs: false,
                            removeViewBox: false,
                        },
                    ],
                }),
                jpegOptim({
                    max: 85,
                    progressive: true,
                }),
            ]),
        );
    }

    stream = stream.on('error', err => {
        notification('images', err);
    });

    return stream.pipe(dest(global.out.image));
};
task('images', images);

/**
 * FIle processing
 *
 * @return {event}
 */
const files = () => {
    const stream = src(global.src.file, {
        allowEmpty: true,
    }).on('error', err => {
        notification('files', err);
    });

    return stream.pipe(dest(global.out.file));
};
task('files', files);

/**
 * Watcher task
 *
 * @param cb
 * @return {cb|void}
 */
// eslint-disable-next-line consistent-return
const watcher = cb => {
    if (env === 'production') {
        return cb();
    }
    watch(global.src.file, files);
    watch(global.src.style, styles);
    watch(`${global.src.script}/**/*.js`, scripts);
    watch(global.src.image, images);
};

/**
 * Gulp default task
 *
 * @returns void
 */
const build = series(parallel(files, styles, scripts), images, watcher);

/**
 * Exportable gulp task
 * @type {{default: *, config: config}}
 */
module.exports = {
    default: build,
    config,
};
