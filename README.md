[![Build Status](https://api.travis-ci.org/laurisvan/request-promise-lite.svg?branch=master)](https://travis-ci.org/laurisvan/request-promise-lite)
[![view on npm](http://img.shields.io/npm/v/request-promise-lite.svg)](https://www.npmjs.org/package/request-promise-lite)
[![npm module downloads per month](http://img.shields.io/npm/dm/request-promise-lite.svg)](https://www.npmjs.org/package/request-promise-lite)
[![Dependency Status](https://david-dm.org/laurisvan/request-promise-lite.svg)](https://david-dm.org/laurisvan/request-promise-lite)
[![Coverage Status](https://coveralls.io/repos/github/laurisvan/request-promise-lite/badge.svg?branch=master)](https://coveralls.io/github/laurisvan/request-promise-lite)

# request-promise-lite

This is a lightweight HTTP Promise client, somewhat compatible with
[request-promise](https://www.npmjs.com/package/request-promise) for node.js 4 or later. It can be used as a replacement where the original client is too heavy, e.g. as part of AWS Lambda functions, or with WebPack.

## Installation

    > npm install --save request-promise-lite

## Usage

Request in request-promise style:

    const request = require('request-promise-lite)'

    request.get('https://httpbin.org/get', { json: true })
      .then((response) => {
        console.log(JSON.stringify(response));
      });

Use bundled classes (Request):

    const url = 'https://httpbin.org/get';
    const req = new request.Request('GET', url, { json: true });

    req.run()
      .then((response) => {
        console.log(JSON.stringify(response));
      });

Use bundled classes (StreamReader):

    const filePath = path.resolve(__dirname, './fixtures/sample.json');
    const stream = fs.createReadStream(filePath);
    const reader = new request.StreamReader(stream);

    reader.readAll()
      .then((output) => {
        console.log(output.toString());
      });

Use bundled classes (superclass RequestError, or specifics ConnectionError,
HTTPError, ParseError):

    const error = new request.HTTPError('I\'m a teapot!', 417, 'teapot');
    throw new request.ParseError(Invalid JSON', 'some message');

Change logging behaviour (works also on per-request basis):

    request.Request.defaults = {
      logger: {
        debug: (...tokens) => {
          console.log('[prefix]', ${util.format(...tokens)});
        }
      }
    }

### Supported options

Node.js [http/https request options](https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_http_request_options_callback)
are passed forward as-is. In addition the following shorthand options are supported:

```
// Options & their default values
{
  agent: false, // The HTTP agent for subsequent calls
  compression: ['gzip', 'deflate'], // Support GZIP or deflate compression
  headers: {}, // The headers to pass forward (as-is)
  json: false, // JSON shortcut for req headers & response parsing
  logger: new ConsoleLogger(), // An object that consumes the logging requests
  maxRedirects: 3, // How many redirects to follow
  resolveWithFullResponse: false, // Resolve with the response, not the body
  verbose: false, // Run the requests in verbose mode (produces logs)
  timeout: 0, // Abort the request if it has not completed within a given number of milliseconds
};
```

The options can be modified per-request by passing the options as a parameter
(see above). Defaults are stored as a static variable that you can access
and modify through Request.defaults:

    // Get the default options and tinker with them.
    const options = request.Request.defaults;
    options.verbose = true;
    request.Request.defaults = options;

    // Just add a few overrides
    request.Request.defaults = { verbose: false };

You can also set the defauls as an environment variable:

    > RPL_DEFAULTS="{ \"verbose\": true}" node myprogram.js

When setting environment variables, please make sure the variable contains a
proper stringified JSON. The environment will be parsed when requiring
request.Request for the first time, and it will throw a TypeError on failure.

## Features

This module already supports a wealth of options. An acceptance test run tells
the situation best:

```
StreamReader
  ✓ Reads a stream fully
  ✓ Reads a that has been chunked by individual writes
  ✓ Fails gracefully on invalid stream
ParseError
  ✓ Supports message, status code and response
  ✓ is an an instance of RequestError
HTTPError
  ✓ Supports message, status code and response
  ✓ Stringifies to a meaningful message
  ✓ is an an instance of RequestError
ConnectionError
  ✓ Supports message and raw message
  ✓ Stringifies to a meaningful message
  ✓ is an an instance of RequestError
Request - test against httpbin.org
  ✓ Supports HTTP (268ms)
  ✓ Supports HTTPS (575ms)
  - Performs TRACE requests
  ✓ Performs HEAD requests (255ms)
  ✓ Performs OPTIONS requests (295ms)
  ✓ Performs GET requests (258ms)
  ✓ Performs POST requests (1255ms)
  ✓ Performs PUT requests (284ms)
  ✓ Performs PATCH requests (247ms)
  ✓ Performs DELETE requests (254ms)
  ✓ Fails with TypeError if no protocol given
  ✓ Fails with TypeError on invalid form data
  ✓ Fails with TypeError on invalid auth data
  ✓ Fails with TypeError on invalid compression scheme
  ✓ Supports query string parameters in URL (512ms)
  ✓ Supports booleans, strings, numbers and undefined in query object (519ms)
  ✓ Accepts custom headers (528ms)
  ✓ Interprets empty response with JSON request as null (272ms)
  ✓ Supports 301-303 redirects (1014ms)
  ✓ Rejects on 4xx errors (259ms)
  ✓ Limits the maximum number of 301-303 redirects (520ms)
  ✓ Supports TLS with passphrase
  ✓ Supports HTTP Basic Auth (513ms)
  ✓ Supports GZIP compression (516ms)
  ✓ Supports Deflate compression (554ms)
  ✓ Supports null options (524ms)
  ✓ Supports 'json' in options (393ms)
  ✓ Supports 'form' in options (x-www-form-urlencoded) (317ms)
  ✓ Supports 'resolveWithFullResponse' in options (259ms)
  - Supports 'multipart' bodies
  ✓ Supports 'verbose' in options (1260ms)
  ✓ Supports custom loggers (263ms)
Options handling
  ✓ Overrides built-in defaults by RPL_DEFAULTS env variable
  ✓ Overrides built-in & env defaults by Request.defaults variable
  ✓ Resets the static defaults when set to {} or null
Error handling
  ✓ Throws TypeError if no protocol given
  ✓ Throws TypeError on invalid form data
  ✓ Throws TypeError on invalid auth data
  ✓ Throws TypeError on invalid compression scheme
  ✓ Throws TypeError when constructing with an invalid method
  ✓ Throws TypeError when constructing with an invalid query string
  ✓ Throws TypeError when constructing with an invalid protocol
  ✓ Throws TypeError when constructing with an invalid path
  ✓ Throws connections to non-existing hosts as ConnectionError
  ✓ Throws ConnectionError when client aborted
  ✓ Throws ConnectionError when server aborted
  ✓ Throws ConnectionError when the timeout is expired
  ✓ Throws ConnectionError on other errors
  ✓ Throws HTTP on HTTP Error code responses 4xx-5xx
  ✓ Throws ParseError when requesting JSON, but getting sth else (259ms)
index.js wrapper
  ✓ Nested methods - request.get (257ms)
  ✓ Nested classes - request.Request (504ms)
  ✓ Nested classes - request.StreamReader


61 passing (13s)
2 pending
```

## Building

The code has been writen in es2015 and transpiled in [Babel](https://babeljs.io/). The transpilation can be run with gulp:

    > gulp build             # If you have gulp in your path
    > npm run-script build   # Use gulp devDependency
    > gulp watch             # Trigger rebuild & test on file changes
    > gulp test              # Run mocha tests & several validators
