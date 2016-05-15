/**
 * A type-safe error that is sent on request failures.
 *
 * Contains status code, error message and the request with its data.
 *
 * @extends Error
 */
export default class RequestError extends Error {

  /**
   * The default constructor: Saves the element data.
   *
   * This class takes no stance on what is passed into Response.
   * In case Request was called with 'resolveWithFullResponse', this
   * value is likely the full response. Otherwise it is likely the body.
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
   * FIXME For some reason toString cannot be overriden.
   *
   * @return {string} String in format <statuscode>: <message>
   */
  toString() {
    return this.statusCode + ': ' + this.message;
  }
}
