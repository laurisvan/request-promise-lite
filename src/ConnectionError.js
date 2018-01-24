const RequestError = require('./RequestError');

/**
 * @typedef {Object} ConnectionError
 *
 * RequestError with Connection specific semantics
 *
 * @extends RequestError
 */
class ConnectionError extends RequestError {

  /**
   * RequestError with HTTP Semantics
   *
   * @param {string} message Human readable error message
   * @param {string} the raw UNIX message that originated this error
   */
  constructor(message, rawMessage) {
    super(message);

    this.rawMessage = rawMessage;
  }
}

module.exports = ConnectionError;
