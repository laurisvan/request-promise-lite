import http from 'http';
import https from 'https';
import urlParser from 'url';
import querystring from 'querystring';
import StreamReader from './StreamReader';
import RequestError from './RequestError';

/**
 * @typedef {Object} Request
 *
 * This module is a lightweight polyfill for request-promise which had
 * problems with WebPack. As a lightweight replacement, it suits well into
 * usage e.g. with Lambda functions.
 */
export default class Request {

  static chooseTransport(protocol) {
    switch (protocol) {
      case 'http:':
        return http;
      case 'https:':
        return https;
      default:
        throw new Error('New Error: Invalid protocol ' + protocol);
    }
  }

  static encodeQuery(map, useQueryString) {
    if (!map) {
      return null;
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

  static parseUrl(url, options) {
    url = url || options.url;

    // Parse the URI & headers. Re-parsing is needed to get the formatting changes
    let parsed = urlParser.parse(url);
    parsed.search = Request.encodeQuery(options.qs, options.useQuerystring) || parsed.search;
    parsed = urlParser.parse(urlParser.format(parsed));

    return parsed;
  }

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
    };

    this.options = Object.assign({}, defaults, options);
    this.method = method;
    this.url = Request.parseUrl(url, options);

    // Parse the input options (affects the instance attributes)
    this.parseOptions();
  }

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
        throw new Error('Incompatible form data: ', options.form);
      }

      body = querystring.stringify(options.form);
      transOpts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      transOpts.headers.Accept = 'application/json';
    }

    if (options.auth) {
      if (typeof options.auth !== 'object') {
        throw new Error('Incompatible auth data', options.auth);
      }

      const user = options.auth.user || options.auth.username;
      const password = options.auth.pass || options.auth.password;

      transOpts.auth = user + ':' + password;
    }

    // Update instance attributes
    this.transportOptions = transOpts;
    this.body = body;
  }

  run() {
    return this.handleRequest()
      .then(this.handleResponse.bind(this));
  }

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
        throw new RequestError(`Invalid JSON: '${body}'`, 0, response);
      }
    }

    if (this.options.resolveWithFullResponse) {
      response.body = body;
      return response;
    }

    // Return the body as-is
    return body;
  }

  handleResponse(res) {
    const status = res.statusCode;
    const reader = new StreamReader(res);
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
        return Promise.reject(new Error('Too many redirects to handle ' + status));
      }

      // Recurse with a new request. Don't use the options
      // query string, as it is already encoded in the new location
      const newOpts = Object.assign({}, options);

      if (newOpts.qs) {
        delete newOpts.qs;
      }

      newOpts.maxRedirects = options.maxRedirects - 1;

      const request = new Request(_this.method, location, newOpts);
      return request.handleRequest()
        .then(request.handleResponse.bind(request));
    }

    return reader.readAll(res)
      .then(body => {
        if (this.options.verbose) {
          let decodedBody = body;
          if (typeof body === 'object' && typeof body.toString === 'function') {
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
        const error = new Error('Error in response \n' + JSON.stringify(response, null, 2));
        return Promise.reject(error);
      });
  }

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
      const transport = Request.chooseTransport(_this.url.protocol);
      const transOpts = this.transportOptions;

      // Process the request
      const req = transport.request(transOpts, res => resolve(res));

      // If we have a body, it should be written
      if (this.body) {
        req.write(this.body);
      }

      req.end();
    });
  }
}
