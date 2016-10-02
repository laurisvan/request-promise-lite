import http from 'http';
import https from 'https';
import urlParser from 'url';
import zlib from 'zlib';
import querystring from 'querystring';
import StreamReader from './StreamReader';
import ConnectionError from './ConnectionError';
import HTTPError from './HTTPError';
import ParseError from './ParseError';

/**
 * @typedef {Object} Request
 *
 * This module is a lightweight polyfill for request-promise which had
 * problems with WebPack. As a lightweight replacement, it suits well into
 * usage e.g. with Lambda functions.
 */
export default class Request {

  /**
   * Chooses the given transport type (HTTP or HTTPS) and returns the
   * corresponding handler.
   *
   * @param {string} protocol - the name of the protocol (http or https)
   * @return {function} that handles the request (http or https)
   * @throws {TypeError{ in case anything else than http or https is specified
   */
  static parseTransport(protocol) {
    switch (protocol) {
      case 'http:':
        return http;
      case 'https:':
        return https;
      default:
        throw new TypeError(`New Error: Invalid protocol ${protocol}`);
    }
  }

  /**
   * Encodes a object key-values pair into an URL query string
   *
   * @param {options} map - The key-value pairs to parse the options from
   * @param {boolean} useQueryString - true if node.js native lib is to be used
   * @throws {TypeError} in case of invalid options
   */
  static parseQuery(map, useQueryString) {
    if (typeof map !== 'object') {
      throw new TypeError('Invalid query string map');
    }

    if (useQueryString) {
      return querystring.stringify(map);
    }

    const tokens = (Object.keys(map)).map(key => {
      const unparsedValues = map[key];
      let values;

      if (typeof unparsedValues === 'undefined') {
        // TODO Check this - can we send keys that have values? request module thinks 'no'
        //return key;
        return '';
      } else if (Array.isArray(unparsedValues)) {
        values = unparsedValues.map(encodeURIComponent);
      } else {
        values = [encodeURIComponent(unparsedValues)];
      }

      const value = values.join(',');
      return [encodeURIComponent(key), value].join('=');
    });

    return tokens.join('&');
  }

  /**
   * Parse an URL object from string and query string nested within options.
   *
   * @param {string} url - The URL to connect to
   * @param {object} options - The supplementary options to pick query string from
   * @throws {TypeError} in case of invalid url or options.
   */
  static parseUrl(url, options) {
    url = url || options.url;

    // Parse the URI & headers. Re-parsing is needed to get the formatting changes
    const parsed = urlParser.parse(url);
    if (options.qs) {
      parsed.search = Request.parseQuery(options.qs, options.useQuerystring);
    }

    // Make sure the URL is a valid one. Use the version by @stephenhay that
    // is short and no false positives, but some false negatives (which is ok).
    // See: https://mathiasbynens.be/demo/url-regex
    const formatted = urlParser.format(parsed);
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (!regex.test(formatted)) {
      throw new TypeError(`Invalid URL: ${formatted}`);
    }

    return urlParser.parse(formatted);
  }

  /**
   * Parses the HTTP method (GET, POST, PUT or DELETE)
   *
   * @param {string} method - the HTTP method to use (GET, POST, PUT or DELETE)
   * @return {string} the parsed method as-is, if succesful
   * @throws {TypeError} in case of invalid method
   */
  static parseMethod(method) {
    if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) !== -1) {
      return method;
    }

    throw new TypeError(`Invalid method '${method}'`);
  }

  /**
   * (Private) constructor that initialises a new request, do not call directly.
   *
   * @param {string} method - the HTTP method to invoke (GET, POST, PUT, DELETE)
   * @param {string} url - The URL to connect to
   * @param {object} options - The supplementary options for the HTTP request
   * @throws {TypeError} in case of invalid method, url or options.
   */
  constructor(method, url, options) {
    // Defaults
    options = options || {};

    // Options & their default values
    const defaults = {
      headers: {},      // The headers to pass forward (as-is)
      maxRedirects: 3,  // How many redirects to follow
      json: false,      // JSON shortcut for req headers & response parsing
      agent: false,     // The HTTP agent for subsequent calls
      resolveWithFullResponse: false, // Resolve with the response, not the body
      verbose: false,   // Whether or not run the requests in verbose mode
      compression: ['gzip', 'deflate'], // Support GZIP or deflate compression
    };

    this.method = Request.parseMethod(method);
    this.url = Request.parseUrl(url, options);
    this.transport = Request.parseTransport(this.url.protocol);

    // Parse the input options (using also this.method, url and transport)
    // Updates this.transportOptions and this.body
    this.options = Object.assign({}, defaults, options);
    this.parseOptions();
  }

  /**
   * Parses the request options from this.url, this.method & this.options
   *
   * @throws {TypeError} in case of invalid options.
   */
  parseOptions() {
    const method = this.method;
    const url = this.url;
    const options = this.options;

    // Form the transport options from input options
    const transOpts = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      headers: options.headers,
      pfx: options.pfx,
      passphrase: options.passphrase,
      rejectUnauthorized: options.rejectUnauthorized,
    };
    let body = options.body;

    // Handle the few known options cases - alter both
    // transport options and generics
    if (options.json) {
      transOpts.headers['Content-Type'] = 'application/json';
      transOpts.headers.Accept = 'application/json';

      if (typeof body === 'object') {
        body = JSON.stringify(body);
      }
    }

    if (options.form) {
      if (typeof options.form !== 'object') {
        throw new TypeError('Incompatible form data: ', options.form);
      }

      body = querystring.stringify(options.form);
      transOpts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      transOpts.headers.Accept = 'application/json';
    }

    if (options.auth) {
      if (typeof options.auth !== 'object') {
        throw new TypeError('Incompatible auth data', options.auth);
      }

      const user = options.auth.user || options.auth.username;
      const password = options.auth.pass || options.auth.password;

      transOpts.auth = user + ':' + password;
    }

    if (options.compression) {
      const comp = options.compression;
      const supported = ['gzip', 'deflate'];

      if (!Array.isArray(comp) || comp.some(v1 => !supported.some(v2 => v1 === v2))) {
        const message = `Invalid compression scheme, '${comp}', expecting string array`;
        throw new TypeError(message);
      }

      transOpts.headers['Accept-Encoding'] = options.compression.join(', ');
    }

    // Update instance attributes
    this.transportOptions = transOpts;
    this.body = body;
  }

  /**
   * Dispatches the request.
   */
  run() {
    return this.handleRequest()
      .then(response => this.handleResponse(response));
  }

  /**
   * Parses the response body and wraps it into a response
   *
   * @param {object} response - the raw node.js HTTP response
   * @param {object} body - the raw node.js HTTP response body
   * @throws {ParseError} in case parsing to the requested type fails
   */
  createResponse(response, body) {
    // Handle the few known special cases
    if (this.options.json) {
      const str = body.toString();
      if (str.length === 0) {
        return null;
      }

      try {
        body = JSON.parse(str);
      } catch (error) {
        throw new ParseError(`Invalid JSON: '${body}'`, error.message);
      }
    }

    if (this.options.resolveWithFullResponse) {
      response.body = body;
      return response;
    }

    // Return the body as-is
    return body;
  }

  /**
   * Processes the HTTP response before parsing it.
   * Handles redirects, decompresses and reads the streams.
   *
   * @param {object} response - the raw node.js HTTP response
   * @param {object} body - the raw node.js HTTP response body
   * @throws {ParseError} in case parsing to the requested type fails
   */
  handleResponse(res) {
    const status = res.statusCode;
    const _this = this;

    if (this.options.verbose) {
      console.info('Response status:', res.statusCode);
      console.info('Response headers:', JSON.stringify(res.headers));
    }

    // Handle redirects
    if (status >= 301 && status <= 303) {
      const location = res.headers.location;
      const options = _this.options;

      // If we're out of the redirect quota, reject
      if (options.maxRedirects < 1) {
        const message = `Too many redirects to handle ${status}`;
        return Promise.reject(new ConnectionError(message));
      }

      // Recurse with a new request. Don't use the options
      // query string, as it is already encoded in the new location string
      const newOpts = Object.assign({}, options);
      if (typeof newOpts.qs !== 'undefined') {
        delete newOpts.qs;
      }
      newOpts.maxRedirects = options.maxRedirects - 1;

      // Create and dispatch the new request
      const request = new Request(_this.method, location, newOpts);
      return request.handleRequest()
        .then(response => request.handleResponse(response));
    }

    // By default, read the response as-is; if compression is given, uncompress.
    const encoding = res.headers['content-encoding'] || '';
    let readStream;
    switch (encoding) {
      case '':
        readStream = res;
        break;
      case 'gzip':
        readStream = res.pipe(zlib.createGunzip());
        break;
      case 'deflate':
        readStream = res.pipe(zlib.createInflate());
        break;
      default:
        return Promise.reject(new ParseError(`Invalid response encoding: '${encoding}'`));
    }

    const reader = new StreamReader(readStream);
    return reader.readAll()
      .then(
          body => {
            if (this.options.verbose) {
              let decodedBody = body;
              if (body && typeof body.toString === 'function') {
                decodedBody = body.toString();
              }

              console.info('Response body:', decodedBody);
            }

            // Handle success cases
            if (status >= 200 && status < 300) {
              return Promise.resolve(this.createResponse(res, body));
            }

            // All other cases
            const response = this.createResponse(res, body);
            const error = new HTTPError('Error in response', status, response);
            return Promise.reject(error);
          },
          error => {
            // Throw errors received from stream reading as connection errors
            const message = `Error reading the response: ${error.message}`;
            return Promise.reject(new ConnectionError(message, error.message));
          }
        );
  }

  /**
   * Handles the request.
   * Chooses a transport, creates the connection and sends the request data.
   *
   * @throws ConnectionError in case connection fails.
   */
  handleRequest() {
    const _this = this;

    return new Promise((resolve, reject) => {
      if (_this.options.verbose) {
        let body = _this.body;
        if (typeof body === 'object' && typeof body.toString === 'function') {
          body = body.toString();
        }

        console.info('Request URL:', urlParser.format(_this.url));
        console.info('Request headers:', _this.transportOptions.headers);
        console.info('Request body:', body);
      }

      // Choose the transport
      const transport = _this.transport;
      const transOpts = _this.transportOptions;

      // Process the request
      const req = transport.request(transOpts);
      req.on('abort', () => {
        const rawMessage = 'Client aborted the request';
        const message = `Connection failed: ${rawMessage}`;
        reject(new ConnectionError(message, rawMessage));
      });
      req.on('aborted', () => {
        const rawMessage = 'Server aborted the request';
        const message = `Connection failed: ${rawMessage}`;
        reject(new ConnectionError(message, rawMessage));
      });
      req.on('error', error => {
        const message = `Connection failed: ${error.message}`;
        reject(new ConnectionError(message, error.message));
      });
      req.on('response', response => {
        resolve(response);
      });
      req.end(this.body);
    });
  }
}
