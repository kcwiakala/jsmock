
const matcher = require('./lib/matcher');
const mock = require('./lib/mock');

module.exports = {
  Mock: mock.Mock,
  UnexpectedCall: mock.UnexpectedCall,
  _: matcher.any
}