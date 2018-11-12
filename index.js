// Global dependencies
const { src, dest, series, lastRun, task, watch, tree } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');

// Style dependencies
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoPrefixer = require('autoprefixer');
const cssNano = require('cssnano');

// Notifications
const notifier = require('node-notifier');

const env = process.env.NODE_ENV || 'production';

const global = {};
const config = options => {
    global.src = options.source;
    global.out = options.destination;
};

const notification = () => {};

const style = () => {
    const processors = [autoPrefixer];
    if (env === 'production') {
        processors.push(cssNano({ discardUnused: { fontFace: false } }));
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
    return stream.pipe(dest(global.out.style));
};
task('style', style);

const files = () => {
    const stream = src(global.src.file)
        .on('error', err => {
            notification('files', err);
            stream.emit('end');
        })
        .pipe(dest(global.out.file));
    return stream;
};

const watcher = () => {
    watch(global.src.style, style);
};

const build = series(files, style, watcher);

module.exports = {
    default: build,
    config,
};
