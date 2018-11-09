import gulp from 'gulp';
import files from './tasks/files';

gulp.task('files', files);

const build = gulp.series(files('./test/src', './test/dist'));
gulp.task('build', build);

module.exports = gulp;
