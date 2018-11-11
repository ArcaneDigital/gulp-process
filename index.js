const { src, dest, series, parallel } = require('gulp');

const global = {};

const env = process.env.NODE_ENV || 'production';

const config = options => {
    global.src = options.src;
    global.out = options.out;
};

const fileTask = () => src(global.src.file).pipe(dest(global.out.file));

const serialBuild = series(fileTask);
const build = parallel(fileTask);

module.exports = {
    default: build,
    serialBuild,
    config,
};
