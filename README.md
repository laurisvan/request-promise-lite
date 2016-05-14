# request-promise-light

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

### Supported options

Node.js [http/https request options](https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_http_request_options_callback)
are passed forward as-is. In addition the following shorthand options are supported:

    // Options & their default values
    let defaults = {
      maxRedirects: 3,  // How many redirects to follow
      json: false,      // JSON shortcut for req headers & response parsing
    };

## Features

A few tests have been written, with a few options supported. Here's a result of a test run:

  ```
  Request
    ✓ Supports HTTP (272ms)
    ✓ Supports HTTPS (494ms)
    ✓ Supports query string parameters in URL (494ms)
    ✓ Accepts custom headers (495ms)
    ✓ Supports 301-303 redirects (1043ms)
    - Supports TLS with passphrase
    - Performs POST requests
    - Performs PUT requests
    - Performs DELETE requests

  StreamReader
    ✓ Reads a stream fully
    - Fails gracefully on invalid stream

  index.js wrapper
    ✓ Nested methods - request.get (243ms)
    ✓ Nested classes - request.Request (494ms)
    ✓ Nested classes - request.StreamReader


  9 passing (4s)
  5 pending
  ```

## Building

The code has been writen in es2015 and transpiled in [Babel](https://babeljs.io/). The transpilation can be run with gulp:

    > gulp build             # If you have gulp in your path
    > npm run-script build   # Use gulp devDependency
    > gulp watch             # Trigger rebuild & test on file changes   
    > gulp test              # Run mocha tests & several validators
    