import Promise  from 'bluebird';
import http from 'http';
import https from 'https';
import urlParser from 'url';
import querystring from 'querystring';
import StreamReader from './StreamReader';

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

    let tokens = (Object.keys(map)).map((key) => {
      let unparsedValues = map[key];
      let values;

      if (!unparsedValues) {
        // TODO Check this - can we send keys that have values? request module thinks 'no'
        //return key;
        return '';
      } else if (Array.isArray(unparsedValues)) {
        values = unparsedValues.map(encodeURIComponent);
      } else {
        values = [encodeURIComponent(unparsedValues)];
      }

      let value = values.join(',');
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

  static parseOptions(method, url, opts) {
    // Handle defaults
    opts = opts || {};
    opts.headers = opts.headers || {};

    // Form options for the request
    let options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.path,
      headers: opts.headers,
      agent: false,
      pfx: opts.pfx,
      passphrase: opts.passphrase,
      rejectUnauthorized: opts.rejectUnauthorized,
    };

    // Handle the few known options cases
    if (opts.json) {
      options.headers.Accept = 'application/json';
    }

    // Reject on some functions we don't have a polyfill for
    if (opts.form) {
      throw new Error('Form sending not supported yet.');
    }

    return options;
  }

  constructor(method, url, options) {
    // Options & their default values
    let defaults = {
      maxRedirects: 3,  // How many redirects to follow
      json: false,      // JSON shortcut for req headers & response parsing
    };

    this.options = Object.assign({}, defaults, options);
    this.method = method;
    this.url = Request.parseUrl(url, options);
    this.transportOptions = Request.parseOptions(method, this.url, options);
  }

  run() {
    return this.handleRequest()
      .then(this.handleResponse.bind(this))
      .then(this.resolve.bind(this));
  }

  resolve(packet) {
    let _this = this;

    return new Promise((resolve, reject) => {
      let body = packet.body;
      let response = packet.response;

      // Handle the few known special cases
      if (_this.options.json) {
        body = JSON.parse(body.toString());
      }

      if (_this.options.resolveWithFullResponse) {
        response.body = body;
        return resolve(response);
      }

      return resolve(body);
    });
  }

  handleResponse(res) {
    let status = res.statusCode;
    let reader = new StreamReader(res);
    let _this = this;

    // Handle redirects
    if (301 <= status && status <= 303) {
      let location = res.headers.location;
      let options = _this.options;

      // If we're out of the redirect quota, reject
      if (options.maxRedirects < 1) {
        return Promise.reject(new Error('Too many redirects to handle ' + status));
      }

      // Recurse with a new request. Don't use the options
      // query string, as it is already encoded in the new location
      // TODO Find a cleaner way of playing with options
      let newOpts = {
        maxRedirects: options.maxRedirects - 1,
        method: options.method,
        json: options.json,
        headers: options.headers,
        passphrase: options.passphrase,
        rejectUnauthorized: options.rejectUnauthorized,
      };
      let request = new Request(_this.method, location, newOpts);
      return request.handleRequest()
        .then(request.handleResponse.bind(request));
    }

    // Handle success cases
    if (status >= 200 && status < 300) {
      return reader.readAll(res)
        .then((body) => Promise.resolve({ response: res, body: body }));
    }

    // All other cases
    return Promise.reject(new Error('Error in response ' + status));
  }

  handleRequest(method, url, opts) {
    let _this = this;

    return new Promise((resolve, reject) => {
      // Choose the transport
      let transport = Request.chooseTransport(_this.url.protocol);
      let opts = this.transportOptions;

      // Process the request
      let req = transport.request(opts, (res) => resolve(res));
      req.end();
    });
  }
}
