import { src, dest } from 'gulp';

export default (input, output) => {
    return src(input).pipe(dest(output));
};
