const rules = ["eslint-config-arcane/prettier.config"].map(
    path => require(path).overrides
);

module.exports = {
    overrides: [].concat.apply([], ...rules)
};
