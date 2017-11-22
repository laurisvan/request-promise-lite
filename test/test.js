'use strict';

describe('request-promise-lite', function () {
  this.timeout(10000);

  require('./StreamReaderSpec.js');
  require('./RequestErrorSpec.js');
  require('./RequestSpec.js');
  require('./indexSpec.js');
});
