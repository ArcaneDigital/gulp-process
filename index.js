const gulp = require('gulp');
const files = require('./tasks/files');

const global = {};

const config = options => () => {
    global.src = options.src;
    global.out = options.out;
};

const configTest = () => console.log(global.src.file);

const fileTask = files({
    input: global.src.file,
    output: global.out.file,
});

const build = gulp.series(fileTask);

module.exports = { build, configTest };
module.exports.config = config;
