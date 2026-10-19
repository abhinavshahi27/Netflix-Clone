module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // deliberate vendor prefixes we keep for mask/gradient coverage
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    // tokens like --step--1 and short component names are intentional
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    // single-file cascade is organised top-down by section banner
    'no-descending-specificity': null,
    // the file's house style predates this lint setup: compact one-line
    // rules, rgba() notation, cased font keywords. Keep meaningful checks,
    // skip pure reformatting.
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    'color-hex-length': null,
    'value-keyword-case': null,
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'comment-empty-line-before': null,
    'media-feature-range-notation': null,
    'length-zero-no-unit': null,
  },
}
