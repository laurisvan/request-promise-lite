import Promise from 'bluebird';
import stream from 'stream';

/**
 * @typedef {Object} StreamReader
 *
 * An utility to working with streams
 */
export default class StreamReader extends stream.Writable {

  /**
   * The default constructor: Saves the element data.
   */
  constructor(readable) {
    super();
    this.buffers = [];
    this.finished = false;
    this.error = null;

    // Pipe the input of the readable stream into this
    readable.pipe(this);

    this.on('error', this.handleError.bind(this));
  }

  write(chunk, callback) {
    this.buffers.push(chunk);
  }

  end(chunk) {
    if (chunk) {
      this.buffers.push(chunk);
    }

    this.finished = true;
    this.emit('finish');
  }

  handleError(error) {
    this.error = error;
  }

  /**
   * Read the stream entirely
   *
   * @return Buffer containing the stream contents
   */
  readAll() {
    var resolve;
    var reject;

    // Else listen for the end or error events
    let handleFinished = () => {
      resolve(Buffer.concat(this.buffers));
    };

    let handleError = (error) => {
      reject(error);
    };

    let handleData = (data) => {
      this.buffers.push(data);
    };

    return new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;

      // Check if the stream has errored already
      if (this.error) {
        return reject(this.error);
      }

      // Check if the readable is drained already
      if (this.finished) {
        return resolve(Buffer.concat(this.buffers));
      }

      this.once('finish', handleFinished);
      this.once('error', handleError);
    })
    .finally((output) => {
      this.removeListener('finish', handleData);
      this.removeListener('finish', handleFinished);
      this.removeListener('error', handleError);
    });
  }
}
