// jshint -W034
// Node needs the declaration to permit usage of 'let' */
'use strict';

const expect = require('chai').expect;
const RequestError = require('../lib/RequestError');

describe('RequestError', () => {

  let message = 'foo';
  let status = 303;
  let response = { foo: 'bar' };
  let error = new RequestError(message, status, response);

  it('Supports message, status code and response', () => {
    expect(error.message).to.equal(message);
    expect(error.statusCode).to.equal(status);
    expect(error.response).to.equal(response);
  });

  it('Stringifies to a meaningful message', () => {
    expect(error.toString()).to.match(/\d{3}:.+/);
  });
});
