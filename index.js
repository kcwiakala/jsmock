
const matcher = require('./lib/matcher');
const mock = require('./lib/mock');

module.exports = {
  _: matcher.any,
  Mock: mock.Mock,
  UnexpectedCall: mock.UnexpectedCall
}