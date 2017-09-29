import util from 'util';

const logger = {
  log: (...tokens) => {
    console.info(util.format(...tokens));
  },
};

export default logger;
