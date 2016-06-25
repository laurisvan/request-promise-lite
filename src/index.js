import Request from './Request';
import StreamReader from './StreamReader';
import RequestError from './RequestError';

/**
 * Default handler that creates a new client and executes it
 */
function handleRequest(method, url, options) {
  const request = new Request(method, url, options);

  return request.run();
}

export default {
  get: handleRequest.bind(null, 'GET'),
  put: handleRequest.bind(null, 'PUT'),
  post: handleRequest.bind(null, 'POST'),
  del: handleRequest.bind(null, 'DELETE'),
  Request: Request,
  StreamReader: StreamReader,
  RequestError: RequestError,
};
