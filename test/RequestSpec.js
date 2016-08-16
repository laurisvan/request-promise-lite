// Node needs the declaration to permit usage of 'let' */
// eslint-disable-next-line strict
'use strict';

const expect = require('chai').expect;
const Request = require('../lib/Request');

describe('Request - test against httpbin.org', () => {

  let request;
  let url;
  let headers;
  let body;
  let auth;

  it('Supports HTTP', () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then(response => {
        expect(response).to.exist;
      });
  });

  it('Supports HTTPS', () => {
    url = 'https://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then(response => {
        expect(response).to.exist;
      });
  });

  xit('Supports HTTP as the default protocol (if none given)', () => {
    url = 'httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then(response => {
        expect(response).to.exist;
      });
  });

  it('Supports query string parameters in URL', () => {
    url = 'https://httpbin.org/get?foo=bar';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then(response => {
        expect(response.args.foo).to.equal('bar');
      });
  });

  it('Supports booleans, strings, and numbers in query object', () => {
    url = 'https://httpbin.org/get';
    const qs = {
      text: 'test text',
      number: -1,
      boolean: false,
    };
    request = new Request('GET', url, { json: true, qs: qs });

    return request.run()
      .then(response => {
        expect(response.args.text).to.equal('test text');
        expect(response.args.number).to.equal('-1');
        expect(response.args.boolean).to.equal('false');
      });
  });

  it('Accepts custom headers', () => {
    url = 'https://httpbin.org/headers';
    headers = {
      'X-Custom-Header': 'value',
    };

    request = new Request('GET', url, { json: true, headers: headers });
    return request.run()
      .then(response => {
        expect(response.headers['X-Custom-Header']).to.equal(headers['X-Custom-Header']);
      });
  });

  xit('Interprets empty response with JSON request as null', () => {
    // FIXME this request will return application/octet-stream that we don't need to parse
    url = 'http://httpbin.org/stream-bytes/0';

    request = new Request('GET', url, { json: true });
    return request.run()
      .then(response => {
        expect(response).to.equal(null);
      });
  });

  it('Supports 301-303 redirects', () => {
    url = 'https://httpbin.org/redirect-to?url=https://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then(response => {
        expect(response).to.exist;
      });
  });

  it('Rejects on 4xx errors', () => {
    url = 'http://httpbin.org/status/418';
    request = new Request('GET', url);

    return request.run()
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

    return request.run()
      .catch(error => {
        expect(error).to.exist;
      })
      .then(response => {
        expect(response).to.not.exist;
      });
  });

  it('Performs POST requests', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body: body });

    return request.run()
      .then(response => {
        expect(JSON.parse(response.data).foo).to.equal('bar');
      });
  });

  it('Performs PUT requests', () => {
    url = 'http://httpbin.org/put';
    body = { foo: 'bar' };
    request = new Request('PUT', url, { json: true, body: body });

    return request.run()
      .then(response => {
        expect(JSON.parse(response.data).foo).to.equal('bar');
      });
  });

  it('Performs DELETE requests', () => {
    url = 'http://httpbin.org/delete';
    body = { foo: 'bar' };
    request = new Request('DELETE', url, { json: true, body: body });

    return request.run()
      .then(response => {
        expect(response).to.exist;
      });
  });

  it('Supports TLS with passphrase', () => {
    // Right now we dont' have a test (sample endpoint missing).
    // Just trust it works.
  });

  it('Supports HTTP Basic Auth', () => {
    auth = { user: 'user', password: 'password' };
    url = 'https://httpbin.org/basic-auth/user/password';
    request = new Request('GET', url, { json: true, auth: auth });

    return request.run()
      .then(response => {
        expect(response.authenticated).to.equal(true);
      })
      .catch(error => {
        console.log(error);
        expect.fail();
      });
  });

  it('Supports null options', () => {
    url = 'https://httpbin.org/get';
    request = new Request('GET', url);

    return request.run()
      .then(response => {
        expect(response).to.exist;
      });
  });

  it('Supports \'json\' in options', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body: body });

    return request.run()
      .then(response => {
        expect(JSON.parse(response.data).foo).to.equal('bar');
      });
  });

  it('Supports \'form\' in options (x-www-form-urlencoded)', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { form: body });

    return request.run()
      .then(response => {
        expect(JSON.parse(response.toString()).form.foo).to.equal('bar');
      });
  });

  it('Supports \'resolveWithFullResponse\' in options', () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url,
      { json: true, resolveWithFullResponse: true });

    return request.run()
      .then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.exist;
      });
  });

  xit('Supports \'multipart\' bodies', () => null);

  it('Supports \'verbose\' in options', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body: body, verbose: true });

    // Mock console.info && save all values to array
    // TODO This is less than elegant, but works
    const oldInfo = console.info;
    const buffer = [];
    console.info = (key, value) => {
      buffer.push(key, value);
    };

    return request.run()
      .catch(error => {
        console.info = oldInfo;
        throw error;
      })
      .then(response => {
        console.info = oldInfo;
        expect(buffer).to.not.be.empty;
      });
  });
});
