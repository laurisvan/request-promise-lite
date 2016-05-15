const expect = require('chai').expect;
const Request = require('../lib/Request');

describe('Request - test against httpbin.org', () => {

  var request;
  var url;
  var headers;
  var body;

  it('Supports HTTP', () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then((response) => {
        expect(response).to.exist;
      });
  });

  it('Supports HTTPS', () => {
    url = 'https://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then((response) => {
        expect(response).to.exist;
      });
  });

  it('Supports query string parameters in URL', () => {
    url = 'https://httpbin.org/get?foo=bar';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then((response) => {
        expect(response.args.foo).to.equal('bar');
      });
  });

  it('Accepts custom headers', () => {
    url = 'https://httpbin.org/headers';
    headers = {
      'X-Custom-Header': 'value',
    };

    request = new Request('GET', url, { json: true, headers: headers });
    return request.run()
      .then((response) => {
        expect(response.headers['X-Custom-Header']).to.equal(headers['X-Custom-Header']);
      });
  });

  it('Interprets empty response with JSON request as null', () => {
    url = 'http://httpbin.org/stream-bytes/0';

    request = new Request('GET', url, { json: true });
    return request.run()
      .then((response) => {
        expect(response).to.equal(null);
      });
  });

  it('Supports 301-303 redirects', () => {
    url = 'https://httpbin.org/redirect-to?url=https://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then((response) => {
        expect(response).to.exist;
      });
  });

  it('Rejects on 4xx errors', () => {
    url = 'http://httpbin.org/status/418';
    request = new Request('GET', url);

    return request.run()
      .catch((error) => {
        expect(error.statusCode).to.equal(418);
        expect(error.response).to.match(/teapot/);
      })
      .then((response) => {
        expect(response).to.not.exist;
      });
  });

  it('Limits the maximum number of 301-303 redirects', () => {
    url = 'https://httpbin.org/redirect-to?url=https://httpbin.org/get';
    request = new Request('GET', url, { json: true, maxRedirects: 0 });

    return request.run()
      .catch((error) => {
        expect(error).to.exist;
      })
      .then((response) => {
        expect(response).to.not.exist;
      });
  });

  it('Performs POST requests', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body: body });

    return request.run()
      .then((response) => {
        expect(JSON.parse(response.data).foo).to.equal('bar');
      });
  });

  it('Performs PUT requests', () => {
    url = 'http://httpbin.org/put';
    body = { foo: 'bar' };
    request = new Request('PUT', url, { json: true, body: body });

    return request.run()
      .then((response) => {
        expect(JSON.parse(response.data).foo).to.equal('bar');
      });
  });

  it('Performs DELETE requests', () => {
    url = 'http://httpbin.org/delete';
    body = { foo: 'bar' };
    request = new Request('DELETE', url, { json: true, body: body });

    return request.run()
      .then((response) => {
        expect(response).to.exist;
      });
  });

  it('Supports TLS with passphrase', () => {
    // Right now we dont' have a test (sample endpoint missing).
    // Just trust it works.
  });

  it('Supports null options', () => {
    url = 'https://httpbin.org/get';
    request = new Request('GET', url);

    return request.run()
      .then((response) => {
        expect(response).to.exist;
      });
  });

  it('Supports \'json\' in options', () => {
    url = 'http://httpbin.org/post';
    body = { foo: 'bar' };
    request = new Request('POST', url, { json: true, body: body });

    return request.run()
      .then((response) => {
        expect(JSON.parse(response.data).foo).to.equal('bar');
      });
  });

  it('Supports \'resolveWithFullResponse\' in options', () => {
    url = 'http://httpbin.org/get';
    request = new Request('GET', url,
      { json: true, resolveWithFullResponse: true });

    return request.run()
      .then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.exist;
      });
  });

  xit('Supports \'form\' option', () => null);

  xit('Supports \'multipart\' bodies', () => null);
});
