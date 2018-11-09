const { src, dest } = require('gulp');

module.exports = ({ input, output }) => () => src(input).pipe(dest(output));
