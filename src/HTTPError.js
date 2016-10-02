import RequestError from './RequestError';

/**
 * RequestError with HTTP Semantics
 *
 * @extends RequestError
 */
export default class HTTPError extends RequestError {

  /**
   * RequestError with HTTP Semantics
   *
   * @param {string} message Human readable error message
   * @param {number} statusCode HTTP status code
   * @param {object} response The raw response or body
   */
  constructor(message, statusCode, response) {
    super(message);

    this.statusCode = statusCode;
    this.response = response;
  }

  /**
   * The default constructor: Saves the element data
   *
   * @return {string} String in format <statuscode>: <message>
   */
  toString() {
    return this.statusCode + ': ' + this.message;
  }
}
