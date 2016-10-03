'use strict';

describe('request-promise-light', function () {
  this.timeout(10000);

  require('./StreamReaderSpec.js');
  require('./RequestErrorSpec.js');
  require('./RequestSpec.js');
  require('./indexSpec.js');
});
