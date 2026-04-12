// Custom Jest resolver that handles "node:" protocol imports for Jest 24.
//
// Newer transitive deps (parse5-parser-stream, undici, cheerio) use
// "node:stream", "node:assert", etc. which Jest 24 cannot resolve.
//
// For "node:X" where X is a built-in, strip the protocol and delegate
// to Jest's default resolver without writing any files.

module.exports = (request, options) => {
  if (request.startsWith('node:')) {
    return options.defaultResolver(request.slice(5), options)
  }
  return options.defaultResolver(request, options)
}
