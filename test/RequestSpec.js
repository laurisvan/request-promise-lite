const expect = require('chai').expect;
const Request = require('../lib/Request');

describe('Request', () => {

  var request;
  var url;
  var headers;

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

  it('Supports 301-303 redirects', () => {
    url = 'https://httpbin.org/redirect-to?url=https://httpbin.org/get';
    request = new Request('GET', url, { json: true });

    return request.run()
      .then((response) => {
        expect(response).to.exist;
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

  xit('Supports TLS with passphrase', () => {
  });

  xit('Performs POST requests', () => {
  });

  xit('Performs PUT requests', () => {
  });

  xit('Performs DELETE requests', () => {
  });
});
