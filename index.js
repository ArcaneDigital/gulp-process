// Global dependencies
const { src, dest, series, parallel, lastRun, task, watch } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');

// Style dependencies
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoPrefixer = require('autoprefixer');
const cssNano = require('cssnano');

// Javascript dependencies
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const glob = require('glob');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const builtIns = require('rollup-plugin-node-builtins');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const { uglify } = require('rollup-plugin-uglify');

// Image dependencies
const imagemin = require('gulp-imagemin');
const jpegOptim = require('imagemin-jpegoptim');

// Notifications
const notifier = require('node-notifier');

const env = process.env.NODE_ENV || 'production';

const global = {};
const config = options => {
    global.src = options.source;
    global.out = options.destination;
};

/*
 * Error Notification
 */
const notification = (stage, err) => {
    if (err) {
        notifier.notify({
            title: `ERROR: ${stage}`,
            message: `There was an error within ${stage}`,
        });
        console.log(err);
    }
};

/*
 * Style Processing
 */
const styles = () => {
    const start = Date.now();
    const processors = [autoPrefixer];

    if (env === 'production') {
        processors.push(cssNano({ discardUnused: { fontFace: false } }));
    }

    if (!lastRun('styles')) {
        console.log('Starting styles ...');
    }

    let stream = src(global.src.style, {
        since: lastRun('styles'),
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
        stream = stream.pipe(sourcemaps.write('.'));
    }

    console.log(`Finished style in ${(Date.now() - start) / 1000} seconds`);
    return stream.pipe(dest(global.out.style));
};
task('styles', styles);

/*
 * Javascript Processing
 */
const outputName = string => {
    const removed = path.parse(string);
    return path.parse(removed.name);
};
const scripts = () => {
    const start = Date.now();

    if (!lastRun('scripts')) {
        console.log('Starting scripts ...');
    }

    const stream = merge(
        glob.sync(global.src.script).map(input =>
            rollup({
                input,
                format: 'umd',
                plugins: [
                    builtIns(),
                    resolve(),
                    babel({
                        presets: ['@babel/env'],
                        babelrc: false,
                    }),
                    uglify(),
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
                .pipe(sourcemaps.write('.'))
                .pipe(dest(`${global.out.script}/scripts`)),
        ),
    );

    console.log(`Finished scripts in ${(Date.now() - start) / 1000} seconds`);
    return stream;
};
task('scripts', scripts);

/*
 * Image Processing
 */
const images = () => {
    const start = Date.now();

    if (!lastRun('images')) {
        console.log('Starting images ...');
    }

    let stream = src(global.src.image, {
        since: lastRun('images'),
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

    console.log(`Finished images in ${(Date.now() - start) / 1000} seconds`);
    return stream.pipe(dest(global.out.image));
};
task('images', images);

/*
 * File Processing
 */
const files = () => {
    const start = Date.now();

    if (!lastRun('files')) {
        console.log('Starting files ...');
    }

    const stream = src(global.src.file, {
        since: lastRun('files'),
        allowEmpty: true,
    }).on('error', err => {
        notification('files', err);
    });

    console.log(`Finished files in ${(Date.now() - start) / 1000} seconds`);
    return stream.pipe(dest(global.out.file));
};
task('files', files);

// eslint-disable-next-line consistent-return
const watcher = cb => {
    if (env === 'production') {
        return cb();
    }
    console.log('Watching for changes...');
    watch(global.src.file, files);
    watch(global.src.style, styles);
    watch(global.src.script, scripts);
    watch(global.src.image, images);
};

const build = series(parallel(files, styles, scripts), images, watcher);

module.exports = {
    default: build,
    config,
};
