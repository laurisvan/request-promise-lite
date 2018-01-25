const lib = require('./src');

module.exports = (options) => {
  const method = options.method || 'get';
  return lib[method.toLowerCase()].call(null, options.uri, options);
};
