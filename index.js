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
const rollup = require('rollup');
const glob = require('fast-glob');
const builtIns = require('rollup-plugin-node-builtins');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
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

/**
 * Remove the string 'public' if it exists in the destination string
 *
 * @param string
 * @returns {*}
 */
const removePublicFolder = string => string.replace('public/', '');

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

/*
 * Javascript Processing
 */
const scripts = () => {
    const output = { format: 'umd', sourcemap: env !== 'production' };
    const plugins = [
        builtIns(),
        resolve(),
        commonjs(),
        babel({
            presets: ['@babel/env'],
            babelrc: false,
        }),
        uglify({
            compress: env === 'production' ? {} : false,
            mangle: env === 'production',
            output: {
                beautify: env !== 'production',
            },
        }),
    ];

    const rollupProcessing = input =>
        rollup
            .rollup({
                input,
                plugins,
            })
            .then(bundle =>
                bundle.write({
                    file: path.basename(input),
                    dir: global.out.script,
                    ...output,
                }),
            );

    const processing = entries => Promise.all(entries.map(rollupProcessing));

    return glob([`${global.src.script}/*.js`]).then(processing);
};
task('scripts', scripts);

/*
 * Image Processing
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

/*
 * File Processing
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

const build = series(parallel(files, styles, scripts), images, watcher);

module.exports = {
    default: build,
    config,
};
