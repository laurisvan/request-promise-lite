// Node needs the declaration to permit usage of 'let' */
// eslint-disable-next-line strict
'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const expect = require('chai').expect;
const fixture = require('./fixtures/sample.json');
const StreamReader = require('../lib/StreamReader');

describe('StreamReader', () => {

  it('Reads a stream fully', () => {
    const filePath = path.resolve(__dirname, './fixtures/sample.json');
    const stream = fs.createReadStream(filePath);
    const reader = new StreamReader(stream);

    return reader.readAll()
      .then(output => {
        const str = output.toString();

        expect(str).to.equal(JSON.stringify(fixture, null, 2));
      });
  });

  xit('Fails gracefully on invalid stream', () => {
    function MockStream() {
      stream.Readable.call(this);
    }

    MockStream.prototype.pipe = writable => {
      this.writable = writable;
    };

    util.inherits(MockStream, stream.Readable);
    const mock = new MockStream();
    const reader = new StreamReader(mock);
    const err = new Error('Bogus error');
    process.nextTick(() => {
      reader.emit('error', err);
    });

    return reader.readAll()
      .then(output => {
        expect(output).to.match('you should not be here');
      })
      .catch(error => {
        expect(error).to.exist;
      });
  });
});
