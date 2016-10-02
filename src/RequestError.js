/**
 * @typedef {Object} RequestError
 *
 * A type-safe error that is sent on request failures. Do not use this directly.
 * This is an abstract class - use HTTPError, ConnectionError or ParseError,
 * instead.
 *
 * @extends Error
 */
export default class RequestError extends Error {

  /**
   * @return {string} the message - as-is
   */
  toString() {
    return this.message;
  }
}
