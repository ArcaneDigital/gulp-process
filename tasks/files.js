import gulp from 'gulp';

const files = (input, output) => gulp.src(input).pipe(gulp.dest(output));

export default files;
