
const matcher = require('./lib/matcher');
const Mock = require('./lib/mock');

module.exports = {
  _: matcher.any,
  Mock: Mock
}