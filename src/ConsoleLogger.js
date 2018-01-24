const util = require('util');

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
class ConsoleLogger {
  /**
   * Logs the debug level message.
   *
   * @param {...tokens} - The message strings or token values in the messages.
   */
  // eslint-disable-next-line class-methods-use-this
  debug(...tokens) {
    console.info(util.format(...tokens));
  }
}

module.exports = ConsoleLogger;
