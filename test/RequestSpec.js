'use strict';

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const http = require('http');
const https = require('https');
const net = require('net');
const EventEmitter = require('events').EventEmitter;
const Stream = require('stream');
const Request = require('../lib/Request');
const HTTPError = require('../lib/HTTPError');
const ConnectionError = require('../lib/ConnectionError');
const ParseError = require('../lib/ParseError');

// See: https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html

describe('Request - test against httpbin.org', () => {
  let request;
  let url;
  let options;
  let headers;
  let body;
  let auth;

  it('Supports HTTP', () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run().then(response => {
      expect(response).to.exist;
    });
  });

  it('Supports HTTPS', () => {
    url = 'https://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run().then(response => {
      expect(response).to.exist;
    });
  });

  // Skipped as most of hte endpoints see TRACE calls as a security concern
  xit('Performs TRACE requests', () => {
    url = 'http://httpbin.org/get';
    body = { foo: 'bar' };
    options = { json: true, body, resolveWithFullResponse: true };
    request = new Request('TRACE', url, options);

    // Trace should echo whatever is sent back to the user with 200
    return request.run().then(response => {
      expect(response.statusCode).to.equal(200);
      expect(JSON.parse(response.body).foo).to.equal('bar');
    });
  });

  it('Performs HEAD requests', () => {
    url = 'http://httpbin.org/get';
    body = { foo: 'bar' };
    options = { json: true, body, resolveWithFullResponse: true };
    request = new Request('HEAD', url, options);

    // HEAD should return a response header, identical to HTTP get.
    return request.run().then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal(null);
      expect(response.headers['content-type']).to.equal('application/json');
    });
  });

  it('Performs OPTIONS requests', () => {
    url = 'http://httpbin.org/get';
    body = { foo: 'bar' };
    options = { json: true, body, resolveWithFullResponse: true };
    request = new Request('OPTIONS', url, options);

    // HEAD should return a response header, identical to HTTP get.
    return request.run().then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal(null);
      expect(response.headers.allow.split(', ').sort()).to.deep.equal(
        'HEAD, OPTIONS, GET'.split(', ').sort()
      );
    });
  });

  it('Performs GET requests', () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run().then(response => {
      expect(response).to.exist;
    });
  });

  it('Performs POST requests', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body });

    return request.run().then(response => {
      expect(JSON.parse(response.data).foo).to.equal('bar');
    });
  });

  it('Performs PUT requests', () => {
    url = 'http://httpbin.org/put';
    body = { foo: 'bar' };
    request = new Request('PUT', url, { json: true, body });

    return request.run().then(response => {
      expect(JSON.parse(response.data).foo).to.equal('bar');
    });
  });

  it('Performs PATCH requests', () => {
    url = 'http://httpbin.org/patch';
    body = { foo: 'bar' };
    request = new Request('PATCH', url, { json: true, body });

    return request.run().then(response => {
      expect(JSON.parse(response.data).foo).to.equal('bar');
    });
  });

  it('Performs DELETE requests', () => {
    url = 'http://httpbin.org/delete';
    body = { foo: 'bar' };
    request = new Request('DELETE', url, { json: true, body });

    return request.run().then(response => {
      expect(response).to.exist;
    });
  });

  it('Fails with TypeError if no protocol given', () => {
    url = 'httpbin.org/get';
    expect(() => new Request('GET', url, { json: true })).to.throw(TypeError);
  });

  it('Fails with TypeError on invalid form data', () => {
    url = 'https://httpbin.org/get';
    expect(() => new Request('POST', url, { form: 'invalidForm' })).to.throw(
      TypeError
    );
  });

  it('Fails with TypeError on invalid auth data', () => {
    url = 'https://httpbin.org/get';
    expect(() => new Request('POST', url, { auth: 'invalidForm' })).to.throw(
      TypeError
    );
  });

  it('Fails with TypeError on invalid compression scheme', () => {
    url = 'https://httpbin.org/get';
    expect(() => new Request('POST', url, { compression: 'magic' })).to.throw(
      TypeError
    );
  });

  it('Supports query string parameters in URL', () => {
    url = 'https://httpbin.org/get?foo=bar&baz';
    request = new Request('GET', url, { json: true });

    return request.run().then(response => {
      expect(response.args.foo).to.equal('bar');
    });
  });

  it('Supports booleans, strings, numbers and undefined in query object', () => {
    url = 'https://httpbin.org/get';
    const qs = {
      text: 'test text',
      number: -1,
      boolean: false,
      undefined,
      array: [1, 2, 3],
    };
    request = new Request('GET', url, { json: true, qs });

    return request.run().then(response => {
      expect(response.args.text).to.equal('test text');
      expect(response.args.number).to.equal('-1');
      expect(response.args.boolean).to.equal('false');
      expect(response.args.undefined).to.exist;
      expect(response.args.array).to.eql(['1', '2', '3']);
    });
  });

  it('Accepts custom headers', () => {
    url = 'https://httpbin.org/headers';
    headers = {
      'X-Custom-Header': 'value',
    };

    request = new Request('GET', url, { json: true, headers });
    return request.run().then(response => {
      expect(response.headers['X-Custom-Header']).to.equal(
        headers['X-Custom-Header']
      );
    });
  });

  it('Interprets empty response with JSON request as null', () => {
    // FIXME this request will return application/octet-stream that we don't need to parse
    url = 'http://httpbin.org/stream/0';

    request = new Request('GET', url, { json: true });
    return request.run().then(response => {
      expect(response).to.equal(null);
    });
  });

  it('Honors http agent provided by user', () => {
    const callTrace = [];
    const agent = new http.Agent();
    agent.createConnection = function () {
      callTrace.push(1);
      return net.createConnection.apply(null, arguments);
    };
    request = new Request('GET', 'http://httpbin.org/get', {
      agent,
    });

    return request.run().then(response => {
      expect(response).to.exist;
      expect(callTrace).to.have.lengthOf(1);
    });
  });

  it('Supports 301-303 redirects', () => {
    url = 'https://httpbin.org/redirect-to';
    const keepAliveAgent = new https.Agent({ keepAlive: true });
    request = new Request('GET', url, {
      json: true,
      qs: { url: 'https://httpbin.org/get' },
      agent: keepAliveAgent,
    });


    return request.run().then(response => {
      expect(response).to.exist;
      const socketName = keepAliveAgent.getName({ host: 'httpbin.org', port: 443 });
      expect(keepAliveAgent.freeSockets[socketName]).to.have.lengthOf(2);
      expect(keepAliveAgent.sockets[socketName]).to.not.exist;
    });
  });

  it('Rejects on 4xx errors', () => {
    url = 'http://httpbin.org/status/418';
    request = new Request('GET', url);

    return request
      .run()
      .catch(error => {
        expect(error.statusCode).to.equal(418);
        expect(error.response).to.match(/teapot/);
      })
      .then(response => {
        expect(response).to.not.exist;
      });
  });

  it('Limits the maximum number of 301-303 redirects', () => {
    url = 'https://httpbin.org/redirect-to?url=https://httpbin.org/get';
    request = new Request('GET', url, { json: true, maxRedirects: 0 });

    return request
      .run()
      .catch(error => {
        expect(error).to.exist;
      })
      .then(response => {
        expect(response).to.not.exist;
      });
  });

  it('Supports TLS with passphrase', () => {
    // Right now we dont' have a test (sample endpoint missing).
    // Just trust it works.
  });

  it('Supports HTTP Basic Auth', () => {
    auth = { user: 'user', password: 'password' };
    url = 'https://httpbin.org/basic-auth/user/password';
    request = new Request('GET', url, { json: true, auth });

    return request
      .run()
      .then(response => {
        expect(response.authenticated).to.equal(true);
      })
      .catch(error => {
        console.log(error);
        expect.fail();
      });
  });

  it('Supports GZIP compression', () => {
    url = 'https://httpbin.org/gzip';
    request = new Request('GET', url, { json: true, compression: ['gzip'] });

    return request.run().then(response => {
      expect(response.gzipped).to.equal(true);
    });
  });

  it('Supports Deflate compression', () => {
    url = 'https://httpbin.org/deflate';
    request = new Request('GET', url, { json: true, compression: ['deflate'] });

    return request.run().then(response => {
      expect(response.deflated).to.equal(true);
    });
  });

  it('Supports null options', () => {
    url = 'https://httpbin.org/get';
    request = new Request('GET', url);

    return request.run().then(response => {
      expect(response).to.exist;
    });
  });

  it("Supports 'json' in options", () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body });

    return request.run().then(response => {
      expect(JSON.parse(response.data).foo).to.equal('bar');
    });
  });

  it("Supports 'form' in options (x-www-form-urlencoded)", () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { form: body });

    return request.run().then(response => {
      expect(JSON.parse(response.toString()).form.foo).to.equal('bar');
    });
  });

  it("Supports 'resolveWithFullResponse' in options", () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url, {
      json: true,
      resolveWithFullResponse: true,
    });

    return request.run().then(response => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.exist;
    });
  });

  xit("Supports 'multipart' bodies", () => null);

  it("Supports 'verbose' in options", () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body, verbose: true });

    // Mock console.info && save all values to array
    // TODO This is less than elegant, but works
    const oldInfo = console.info;
    const buffer = [];
    console.info = (key, value) => {
      buffer.push(key, value);
    };

    return request
      .run()
      .catch(error => {
        console.info = oldInfo;
        throw error;
      })
      .then(() => {
        console.info = oldInfo;
        expect(buffer).to.not.be.empty;
      });
  });

  it("Supports 'timeout' in options", () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url, {
      json: true,
      resolveWithFullResponse: true,
      timeout: 10,
    });

    return request.run().then(
      () => expect('should not succeed').to.equal(true),
      error => {
        expect(error).to.be.instanceof(ConnectionError);
        expect(error.message).to.equal(
          'Connection failed: Client aborted the request'
        );
      }
    );
  });

  it('Supports custom loggers', () => {
    let count = 0;
    const logger = {
      debug: () => {
        count += 1;
      },
    };

    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, {
      json: true,
      body,
      verbose: true,
      logger,
    });

    return request.run().then(() => {
      expect(count).to.be.above(0);
    });
  });
});

describe('Options handling', () => {
  const envOptions = { env: true, envOverriden: false };
  const staticOptions = { envOverriden: true };

  beforeEach(() => {
    process.env.RPL_DEFAULTS = JSON.stringify(envOptions);
    Request.defaults = staticOptions;
  });

  it('Overrides built-in defaults by RPL_DEFAULTS env variable', () => {
    expect(Request.defaults.env).to.equal(true);
  });

  it('Overrides built-in & env defaults by Request.defaults variable', () => {
    expect(Request.defaults.envOverriden).to.equal(true);
    expect(Request.defaults.env).to.equal(true);
  });

  it('Resets the static defaults when set to {} or null', () => {
    Request.defaults = {};
    expect(Request.defaults.envOverriden).to.equal(false);
  });

  afterEach(() => {
    delete process.env.RPL_DEFAULTS;
    Request.defaults = {};
  });
});

describe('Error handling', () => {
  let request;
  let url;
  let body;
  let ProxiedRequest;

  function createConnectionErrorStub(event, data) {
    const stub = {
      request() {
        const fakeClientRequest = new EventEmitter();
        fakeClientRequest.end = function () {
          this.emit(event, data);
        };
        return fakeClientRequest;
      },
    };
    return proxyquire('../lib/Request', {
      http: stub,
    });
  }

  function createHTTPErrorStub(event, data) {
    const stub = {
      request() {
        const fakeClientRequest = new EventEmitter();
        fakeClientRequest.end = function () {
          const buffer = new Buffer('{ "stub": "output" }');
          const bufferStream = new Stream.PassThrough();
          bufferStream.end(buffer);

          this.emit('response', Object.assign(bufferStream, data));
        };
        return fakeClientRequest;
      },
    };
    return proxyquire('../lib/Request', {
      http: stub,
    });
  }

  it('Throws TypeError if no protocol given', () => {
    url = 'httpbin.org/get';
    expect(() => new Request('GET', url, { json: true })).to.throw(TypeError);
  });

  it('Throws TypeError on invalid form data', () => {
    url = 'https://httpbin.org/get';
    expect(() => new Request('POST', url, { form: 'invalidForm' })).to.throw(
      TypeError
    );
  });

  it('Throws TypeError on invalid auth data', () => {
    url = 'https://httpbin.org/get';
    expect(() => new Request('POST', url, { auth: 'invalidForm' })).to.throw(
      TypeError
    );
  });

  it('Throws TypeError on invalid compression scheme', () => {
    url = 'https://httpbin.org/get';
    expect(() => new Request('POST', url, { compression: 'magic' })).to.throw(
      TypeError
    );
  });

  it('Throws TypeError when constructing with an invalid method', () => {
    url = 'http://httpbin.org/get';
    expect(() => new Request('FOO', url, { json: true })).to.throw(TypeError);
  });

  it('Throws TypeError when constructing with an invalid query string', () => {
    url = 'http://httpbin.org/get';
    expect(
      () => new Request('GET', url, { qs: 'invalid', json: true })
    ).to.throw(TypeError);
  });

  it('Throws TypeError when constructing with an invalid protocol', () => {
    url = 'foo://httpbin.org/get';
    expect(() => new Request('GET', url, { json: true })).to.throw(TypeError);
  });

  it('Throws TypeError when constructing with an invalid path', () => {
    // See https://mathiasbynens.be/demo/url-regex
    url = 'http://##/';
    expect(() => new Request('GET', url, { json: true })).to.throw(TypeError);
  });

  it('Throws connections to non-existing hosts as ConnectionError', () => {
    url = 'http://foo.not.com/';
    request = new Request('POST', url, { json: true, body });

    return request
      .run()
      .then(
        () => expect('should not succeed').to.equal(true),
        error => expect(error).to.be.instanceof(ConnectionError)
      );
  });

  it('Throws ConnectionError when client aborted', () => {
    url = 'http://httpbin.org/get';
    ProxiedRequest = createConnectionErrorStub(
      'abort',
      new Error('Connection aborted')
    );
    request = new ProxiedRequest('GET', url, { json: true });

    return request.run().then(
      () => expect('should not succeed').to.equal(true),
      error => {
        expect(error).to.be.instanceof(ConnectionError);
        expect(error.message).to.equal(
          'Connection failed: Client aborted the request'
        );
      }
    );
  });

  it('Throws ConnectionError when server aborted', () => {
    url = 'http://httpbin.org/get';
    ProxiedRequest = createConnectionErrorStub(
      'aborted',
      new Error('Connection aborted')
    );
    request = new ProxiedRequest('GET', url, { json: true });

    return request.run().then(
      () => expect('should not succeed').to.equal(true),
      error => {
        expect(error).to.be.instanceof(ConnectionError);
        expect(error.message).to.equal(
          'Connection failed: Server aborted the request'
        );
      }
    );
  });

  it('Throws ConnectionError on other errors', () => {
    url = 'http://httpbin.org/get';
    ProxiedRequest = createConnectionErrorStub(
      'error',
      new Error('Some other error')
    );
    request = new ProxiedRequest('GET', url, { json: true });

    return request.run().then(
      () => expect('should not succeed').to.equal(true),
      error => {
        expect(error).to.be.instanceof(ConnectionError);
        expect(error.message).to.equal('Connection failed: Some other error');
      }
    );
  });

  it('Throws HTTP on HTTP Error code responses 4xx-5xx', () => {
    url = 'http://httpbin.org/get';
    ProxiedRequest = createHTTPErrorStub('request', {
      headers: {},
      statusCode: 500,
    });
    request = new ProxiedRequest('GET', url, { json: true });

    return request.run().then(
      () => expect('should not succeed').to.equal(true),
      error => {
        expect(error).to.be.instanceof(HTTPError);
        expect(error.toString()).to.equal('500: Error in response');
      }
    );
  });

  it('Throws ParseError when requesting JSON, but getting sth else', () => {
    url = 'http://httpbin.org/bytes/1024';
    request = new Request('GET', url, { json: true });

    return request.run().then(
      () => expect('should not succeed').to.equal(true),
      error => {
        expect(error).to.be.instanceof(ParseError);
      }
    );
  });
});
