import util from 'util';

/**
 * Default RPL logger implementation that echoes debug messages to console.
 *
 * This mainly exists as a sample on how to bind the RPL debug messages to
 * whatever logging facility needed.
 *
 * Note that the implementation does not need to be a ES6 class - it can be a
 * simple object that contains 'debug' function. Please note that this may be
 * later extended to include other syslog level methods (such as info, warn
 * etc.), if we ever get a use case.
 */
export default class ConsoleLogger {
  /**
   * Logs the debug level message.
   *
   * @param {...tokens} - The message strings or token values in the messages.
   */
  // eslint-disable-next-line class-methods-use-this
  log(...tokens) {
    console.info(util.format(...tokens));
  }

  logRequest(req) {
    this.log('Request URL: %j', req.url);
    this.log('Request headers: %j', req.transportOptions.headers);
    this.log(
      'Request body: %s',
      req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body)
    );
  }

  logResponseHeaders(res) {
    this.log('Response status: %s', res.statusCode);
    this.log('Response headers: %j', res.headers);
  }
  logResponseBody(body) {
    this.log('Response body: %s', body instanceof Buffer ? body.toString() : JSON.stringify(body));
  }
}
