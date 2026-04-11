/**
 * Custom Jest transformer for TypeScript files using @swc/core directly.
 * Needed because @swc/jest v0.2.2 caches its config globally on first use,
 * making it incompatible with per-extension config splits in Jest 24.
 */
const { transformSync } = require('@swc/core');

module.exports = {
  process(src, filename) {
    if (/\.tsx?$/.test(filename)) {
      return transformSync(src, {
        filename,
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            hidden: { jest: true },
          },
        },
        module: {
          type: 'commonjs',
        },
      });
    }
    return src;
  },
};
