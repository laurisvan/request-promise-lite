'use strict';

const path = require('path');
const fs = require('fs');
const stream = require('stream');
const expect = require('chai').expect;
const fixture = require('./fixtures/sample.json');
const StreamReader = require('../lib/StreamReader');

describe('StreamReader', () => {

  it('Reads a stream fully', () => {
    const filePath = path.resolve(__dirname, './fixtures/sample.json');
    const readStream = fs.createReadStream(filePath);
    const reader = new StreamReader(readStream);

    return reader.readAll()
      .then(output => {
        const str = output.toString();
        expect(str).to.equal(JSON.stringify(fixture, null, 2));
      });
  });

  it('Reads a that has been chunked by individual writes', () => {
    class MockStream extends stream.Readable {
      pipe(writable) {
        this.writable = writable;
      }
    }

    const reader = new StreamReader(new MockStream());
    let writeCalled = false;
    let endCalled = false;

    reader.write('Test string', () => (writeCalled = true));
    reader.end('Test string', () => (endCalled = true));

    expect(writeCalled).to.equal(true);
    expect(endCalled).to.equal(true);
  });

  it('Fails gracefully on invalid stream', () => {
    class MockStream extends stream.Readable {
      pipe(writable) {
        this.writable = writable;
      }
    }

    const mock = new MockStream();
    const reader = new StreamReader(mock);
    const err = new Error('Bogus error');

    process.nextTick(() => reader.emit('error', err));

    return reader.readAll()
      .then(
        output => (expect(output).to.match('you should not be here')),
        error => {
          expect(error).to.exist;
          expect(error).to.equal(err);
        }
      );
  });
});
