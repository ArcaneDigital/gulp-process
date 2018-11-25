const tasks = require('../index');

tasks.config({
    source: {
        file: 'src/files/**/*.*',
        image: 'src/images/**/*.*',
        script: 'src/js',
        style: 'src/scss/**/*.scss',
    },
    destination: {
        image: 'dist/images',
        script: 'dist/scripts',
        style: 'dist/styles',
        file: 'dist/files',
    },
});

// Gulp does not support ES module exports, default to older syntax to
// expose tasks to Gulp CLI
module.exports = tasks;
