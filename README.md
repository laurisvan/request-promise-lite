# request-promise-compatible

This is a lightweight HTTP Promise client, somewhat compatible with
[request-promise](https://www.npmjs.com/package/request-promise) for node.js 4 or later. It can be used as a replacement where the original client is too heavy, e.g. as part of AWS Lambda functions, or with WebPack.

## Installation

    > npm install --save request-promise-compatible

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

    > gulp watch             # Trigger rebuild & test on file changes
    > gulp test              # Run mocha tests & several validators
