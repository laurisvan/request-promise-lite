const Request = require('./Request');
const StreamReader = require('./StreamReader');
const RequestError = require('./RequestError');
const ConnectionError = require('./ConnectionError');
const HTTPError = require('./HTTPError');
const ParseError = require('./ParseError');

/**
 * Default handler that creates a new client and executes it
 */
function handleRequest(method, url, options) {
  const request = new Request(method, url, options);

  return request.run();
}

module.exports = {
  trace: handleRequest.bind(null, 'TRACE'),
  head: handleRequest.bind(null, 'HEAD'),
  options: handleRequest.bind(null, 'OPTIONS'),
  get: handleRequest.bind(null, 'GET'),
  post: handleRequest.bind(null, 'POST'),
  put: handleRequest.bind(null, 'PUT'),
  patch: handleRequest.bind(null, 'PATCH'),
  del: handleRequest.bind(null, 'DELETE'),
  Request,
  StreamReader,
  RequestError,
  ConnectionError,
  HTTPError,
  ParseError,
};
