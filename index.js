// Global dependencies
const { src, dest, series, parallel, lastRun, task, watch } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');

// Style dependencies
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoPrefixer = require('autoprefixer');
const cssNano = require('cssnano');

// Javascript dependencies

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
const notification = err => {
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
const style = () => {
    const start = Date.now();
    const processors = [autoPrefixer];

    if (env === 'production') {
        processors.push(cssNano({ discardUnused: { fontFace: false } }));
    }

    if (!lastRun('style')) {
        console.log('Starting styles ...');
    }

    let stream = src(global.src.style, { since: lastRun('style') });

    if (env !== 'production') {
        stream = stream.pipe(sourcemaps.init());
    }

    stream = stream
        .pipe(sassGlob())
        .pipe(sass({ includePaths: ['./node_modules/**/'] }))
        .on('error', err => {
            notification('styles', err);
            stream.emit('end');
        })
        .pipe(postcss(processors));

    if (env !== 'production') {
        stream = stream.pipe(sourcemaps.write('.'));
    }

    console.log(`Finished style in ${(Date.now() - start) / 1000} seconds`);
    return stream.pipe(dest(global.out.style));
};
task('style', style);

/*
 * Javascript Processing
 */
// const scripts = () => {
//     const start = Date.now();
//
//     console.log(`Finished style in ${(Date.now() - start) / 1000} seconds`);
//     return stream.pipe()
// }
// task('scripts', scripts);

/*
 * Image Processing
 */
const images = () => {
    const start = Date.now();

    if (!lastRun('images')) {
        console.log('Starting images ...');
    }

    let stream = src(global.src.image, { since: lastRun('images') });

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
        stream.emit('end');
    });

    console.log(`Finished images in ${(Date.now() - start) / 1000} seconds`);
    return stream.pipe(dest(global.out.image));
};
task('scripts', images);

/*
 * File Processing
 */
const files = () => {
    const stream = src(global.src.file, { since: lastRun('files') })
        .on('error', err => {
            notification('files', err);
            stream.emit('end');
        })
        .pipe(dest(global.out.file));
    return stream;
};
task('files', files);

// eslint-disable-next-line consistent-return
const watcher = cb => {
    if (env === 'production') {
        return cb();
    }
    console.log('Watching for changes...');
    watch(global.src.file, files);
    watch(global.src.style, style);
    watch(global.src.image, images);
};

const build = series(parallel(files, style), images, watcher);

module.exports = {
    default: build,
    config,
};
