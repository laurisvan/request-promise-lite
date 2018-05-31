const RequestError = require('./RequestError');

/**
 * RequestError with HTTP Semantics
 *
 * @extends RequestError
 */
class HTTPError extends RequestError {

  /**
   * RequestError with HTTP Semantics
   *
   * @param {string} message Human readable error message
   * @param {number} statusCode HTTP status code
   * @param {object} response The raw response or body
   */
  constructor(errorBody, statusCode, response) {
    const message = `${statusCode} - ${JSON.stringify(errorBody)}`;
    super(message);

    this.statusCode = statusCode;
    this.response = response;
    this.error = errorBody;
  }

  /**
   * The default constructor: Saves the element data
   *
   * @return {string} String in format <statuscode>: <message>
   */
  toString() {
    return `${this.statusCode}: ${this.message}`;
  }
}

module.exports = HTTPError;
