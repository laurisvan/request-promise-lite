const expect = require('chai').expect;
const RequestError = require('../lib/RequestError');

describe('RequestError', () => {

  var message = 'foo';
  var status = 303;
  var response = { foo: 'bar' };
  var error = new RequestError(message, status, response);

  it('Supports message, status code and response', () => {
    expect(error.message).to.equal(message);
    expect(error.statusCode).to.equal(status);
    expect(error.response).to.equal(response);
  });

  it('Stringifies to a meaningful message', () => {
    expect(error.toString()).to.match(/\d{3}:.+/);
  });
});
