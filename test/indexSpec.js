'use strict';

const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const fixture = require('./fixtures/sample.json');
const request = require('../lib');

describe('index.js wrapper', () => {

  it('Nested methods - request.get', () =>
    request.get('http://httpbin.org/get', { json: true })
      .then(response => expect(response).to.exist)
  );

  it('Nested classes - request.Request', () => {
    const url = 'https://httpbin.org/get';
    const req = new request.Request('GET', url, { json: true });

    return req.run()
      .then(response => expect(response).to.exist);
  });

  it('Nested classes - request.StreamReader', () => {
    const filePath = path.resolve(__dirname, './fixtures/sample.json');
    const stream = fs.createReadStream(filePath);
    const reader = new request.StreamReader(stream);

    return reader.readAll()
      .then(output => {
        const str = output.toString();

        expect(str).to.equal(JSON.stringify(fixture, null, 2));
      });
  });

});
