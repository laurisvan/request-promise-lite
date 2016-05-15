[![Build Status](https://api.travis-ci.org/laurisvan/request-promise-lite.svg?branch=master)](https://travis-ci.org/laurisvan/request-promise-lite)
[![view on npm](http://img.shields.io/npm/v/request-promise-lite.svg)](https://www.npmjs.org/package/request-promise-lite)
[![npm module downloads per month](http://img.shields.io/npm/dm/request-promise-lite.svg)](https://www.npmjs.org/package/request-promise-lite)
[![Dependency Status](https://david-dm.org/laurisvan/request-promise-lite.svg)](https://david-dm.org/laurisvan/request-promise-lite)

# request-promise-lite

This is a lightweight HTTP Promise client, somewhat compatible with
[request-promise](https://www.npmjs.com/package/request-promise).
It can be used as a replacement where the original client is too heavy, e.g. as part of AWS Lambda functions, or with WebPack.

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

Use bundled classes (StreamReader):
    var error = new request.RequestError('I'm a teapot!', 417, 'teapot');

### Supported options

Node.js [http/https request options](https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_http_request_options_callback)
are passed forward as-is. In addition the following shorthand options are supported:

    // Options & their default values
    let defaults = {
      headers: {},      // The headers to pass forward (as-is)
      maxRedirects: 3,  // How many redirects to follow
      json: false,      // JSON shortcut for req headers & response parsing
      agent: false,     // The HTTP agent for subsequent calls
      resolveWithFullResponse: false, // Resolve with the response, not the body
    };

## Features

A few tests have been written, with a few options supported. Here's a result of a test run:

  ```
  RequestError
    ✓ Supports message, status code and response
    - Stringifies to a meaningful message

  Request - test against httpbin.org
    ✓ Supports HTTP (288ms)
    ✓ Supports HTTPS (565ms)
    ✓ Supports query string parameters in URL (405ms)
    ✓ Accepts custom headers (385ms)
    ✓ Interprets empty response with JSON request as null (256ms)
    ✓ Supports 301-303 redirects (786ms)
    ✓ Rejects on 4xx errors (270ms)
    ✓ Limits the maximum number of 301-303 redirects (405ms)
    ✓ Performs POST requests (270ms)
    ✓ Performs PUT requests (255ms)
    ✓ Performs DELETE requests (309ms)
    ✓ Supports TLS with passphrase
    ✓ Supports null options (384ms)
    ✓ Supports 'json' in options (284ms)
    ✓ Supports 'resolveWithFullResponse' in options (277ms)
    - Supports 'form' option
    - Supports 'multipart' bodies

  StreamReader
    ✓ Reads a stream fully
    - Fails gracefully on invalid stream

  index.js wrapper
    ✓ Nested methods - request.get (271ms)
    ✓ Nested classes - request.Request (413ms)
    ✓ Nested classes - request.StreamReader


  20 passing (6s)
  4 pending
  ```

## Building

The code has been writen in es2015 and transpiled in [Babel](https://babeljs.io/). The transpilation can be run with gulp:

    > gulp build             # If you have gulp in your path
    > npm run-script build   # Use gulp devDependency
    > gulp watch             # Trigger rebuild & test on file changes   
    > gulp test              # Run mocha tests & several validators
    