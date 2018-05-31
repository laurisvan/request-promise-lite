'use strict';

const expect = require('chai').expect;
const RequestError = require('../src/RequestError');
const ConnectionError = require('../src/ConnectionError');
const HTTPError = require('../src/HTTPError');
const ParseError = require('../src/ParseError');

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
  const errorBody = { error: message };
  const statusCode = 303;
  const response = { foo: 'bar' };
  const error = new HTTPError(errorBody, statusCode, response);

  it('Supports message, status code and response', () => {
    expect(error.message).to.equal(`${statusCode} - ${JSON.stringify(errorBody)}`);
    expect(error.statusCode).to.equal(statusCode);
    expect(error.response).to.equal(response);
    expect(error.error).to.equal(errorBody);
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
