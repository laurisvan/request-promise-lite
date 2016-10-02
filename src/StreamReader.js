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

  write(chunk, encoding, callback) {
    // Handle optional parameters
    if (typeof encoding === 'function') {
      callback = encoding;
    }

    this.buffers.push(chunk);

    if (callback) {
      callback();
    }
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
    const _this = this;
    const promise = new Promise((resolve, reject) => {

      function cleanup() {
        /* eslint-disable no-use-before-define */
        _this.removeListener('finish', handleData);
        _this.removeListener('finish', handleFinished);
        _this.removeListener('error', handleError);

        /* eslint-enable no-use-before-define */
      }

      function handleData(data) {
        _this.buffers.push(data);
      }

      function handleError(error) {
        reject(error);
        cleanup();
      }

      // Else listen for the end or error events
      function handleFinished() {
        resolve(Buffer.concat(_this.buffers));
        cleanup();
      }

      // Check if the stream has errored already
      if (_this.error) {
        reject(_this.error);
        return;
      }

      // Check if the readable is drained already
      if (_this.finished) {
        resolve(Buffer.concat(_this.buffers));
        return;
      }

      _this.once('finish', handleFinished);
      _this.once('error', handleError);
    });

    return promise;
  }
}
