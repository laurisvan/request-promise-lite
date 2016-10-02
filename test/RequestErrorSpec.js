'use strict';

const expect = require('chai').expect;
const RequestError = require('../lib/RequestError');
const ConnectionError = require('../lib/ConnectionError');
const HTTPError = require('../lib/HTTPError');
const ParseError = require('../lib/ParseError');

describe('ParseError', () => {
  const message = 'foo';
  const rawMessage = 'raw';

  const error = new ParseError(message, rawMessage);

  it('Supports message, status code and response', () => {
    expect(error.message).to.equal(message);
    expect(error.rawMessage).to.equal(rawMessage);
  });

  it('is an an instance of RequestError', () => {
    expect(error).to.be.instanceof(RequestError);
  });
});


describe('HTTPError', () => {
  const message = 'foo';
  const statusCode = 303;
  const response = { foo: 'bar' };
  const error = new HTTPError(message, statusCode, response);

  it('Supports message, status code and response', () => {
    expect(error.message).to.equal(message);
    expect(error.statusCode).to.equal(statusCode);
    expect(error.response).to.equal(response);
  });

  it('Stringifies to a meaningful message', () => {
    expect(error.toString()).to.match(/\d{3}:.+/);
  });

  it('is an an instance of RequestError', () => {
    expect(error).to.be.instanceof(RequestError);
  });
});

describe('ConnectionError', () => {
  const message = 'foo';
  const rawMessage = 'raw';

  const error = new ConnectionError(message, rawMessage);

  it('Supports message and raw message', () => {
    expect(error.message).to.equal(message);
    expect(error.rawMessage).to.equal(rawMessage);
  });

  it('Stringifies to a meaningful message', () => {
    expect(error.toString()).to.equal(message);
  });

  it('is an an instance of RequestError', () => {
    expect(error).to.be.instanceof(RequestError);
  });
});
