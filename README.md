[![Build Status](https://api.travis-ci.org/laurisvan/request-promise-lite.svg?branch=master)](https://travis-ci.org/laurisvan/request-promise-lite)
[![view on npm](http://img.shields.io/npm/v/request-promise-lite.svg)](https://www.npmjs.org/package/request-promise-lite)
[![npm module downloads per month](http://img.shields.io/npm/dm/request-promise-lite.svg)](https://www.npmjs.org/package/request-promise-lite)
[![Dependency Status](https://david-dm.org/laurisvan/request-promise-lite.svg)](https://david-dm.org/laurisvan/request-promise-lite)
[![Coverage Status](https://coveralls.io/repos/laurisvan/request-promise-lite/badge.svg?branch=master)](https://coveralls.io/r/laurisvan/request-promise-lite?branch=master)

# request-promise-lite

This is a lightweight HTTP Promise client, somewhat compatible with
[request-promise](https://www.npmjs.com/package/request-promise) for node.js 4 or later. It can be used as a replacement where the original client is too heavy, e.g. as part of AWS Lambda functions, or with WebPack.

## Usage

Request in request-promise style:

    var request = require('request-promise-lite)'

    request.get('https://httpbin.org/get', { json: true })
      .then((response) => {
        console.log(JSON.stringify(response));
      });

Use bundled classes (Request):

    var url = 'https://httpbin.org/get';
    var req = new request.Request('GET', url, { json: true });

    req.run()
      .then((response) => {
        console.log(JSON.stringify(response));
      }

Use bundled classes (StreamReader):

    var filePath = path.resolve(__dirname, './fixtures/sample.json');
    var stream = fs.createReadStream(filePath);
    var reader = new request.StreamReader(stream);

    reader.readAll()
      .then((output) => {
        console.log(output.toString());
      }

Use bundled classes (superclass RequestError, or specifics ConnectionError,
HTTPError, ParseError):

    var error = new request.HTTPError('I'm a teapot!', 417, 'teapot');
    throw new request.ParseError(`Invalid JSON: '${body}'`, error.message);

### Supported options

Node.js [http/https request options](https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_http_request_options_callback)
are passed forward as-is. In addition the following shorthand options are supported:

```
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
```

## Features

A few tests have been written, with a few options supported. Here's a result of a test run:

```
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
  ✓ Supports HTTP (269ms)
  ✓ Supports HTTPS (635ms)
  - Supports HTTP as the default protocol (if none given)
  ✓ Supports query string parameters in URL (390ms)
  ✓ Supports booleans, strings, and numbers in query object (403ms)
  ✓ Accepts custom headers (436ms)
  - Interprets empty response with JSON request as null
  ✓ Supports 301-303 redirects (784ms)
  ✓ Rejects on 4xx errors (258ms)
  ✓ Limits the maximum number of 301-303 redirects (434ms)
  ✓ Performs POST requests (271ms)
  ✓ Performs PUT requests (255ms)
  ✓ Performs DELETE requests (246ms)
  ✓ Supports TLS with passphrase
  ✓ Supports HTTP Basic Auth (400ms)
  ✓ Supports GZIP compression (479ms)
  ✓ Supports null options (379ms)
  ✓ Supports 'json' in options (265ms)
  ✓ Supports 'form' in options (x-www-form-urlencoded) (263ms)
  ✓ Supports 'resolveWithFullResponse' in options (254ms)
  - Supports 'multipart' bodies
  ✓ Supports 'verbose' in options (258ms)

Error handling
  ✓ Throws TypeError when constructing with an invalid method
  ✓ Throws TypeError when constructing with an invalid query string
  ✓ Throws TypeError when constructing with an invalid protocol
  ✓ Throws TypeError when constructing with an invalid path
  ✓ Throws connections to non-existing hosts as ConnectionError
  ✓ Throws ConnectionError when client aborted
  ✓ Throws ConnectionError when server aborted
  ✓ Throws ConnectionError on other errors
  ✓ Throws ParseError when requesting JSON, but getting sth else (289ms)

StreamReader
  ✓ Reads a stream fully
  - Fails gracefully on invalid stream

index.js wrapper
  ✓ Nested methods - request.get (253ms)
  ✓ Nested classes - request.Request (385ms)
  ✓ Nested classes - request.StreamReader


40 passing (8s)
4 pending
```

## Building

The code has been writen in es2015 and transpiled in [Babel](https://babeljs.io/). The transpilation can be run with gulp:

    > gulp build             # If you have gulp in your path
    > npm run-script build   # Use gulp devDependency
    > gulp watch             # Trigger rebuild & test on file changes
    > gulp test              # Run mocha tests & several validators
