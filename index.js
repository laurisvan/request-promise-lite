const lib = require('./src');

module.exports = (url, options) => {
  if (typeof url === 'object') {
    options = url;
  } else {
    options.uri = url;
  }
  const method = options.method || 'get';
  return lib[method.toLowerCase()].call(null, options.uri, options);
};
