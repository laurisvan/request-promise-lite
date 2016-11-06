import Request from './Request';
import StreamReader from './StreamReader';
import RequestError from './RequestError';
import ConnectionError from './ConnectionError';
import HTTPError from './HTTPError';
import ParseError from './ParseError';

/**
 * Default handler that creates a new client and executes it
 */
function handleRequest(method, url, options) {
  const request = new Request(method, url, options);

  return request.run();
}

export default {
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
