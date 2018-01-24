const lib = require('./src');

module.exports = (url, options) => {
  const method = options.method || 'get';
  return lib[method.toLowerCase()].call(null, url, options);
};
