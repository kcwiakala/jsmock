
const {ANY, OBJECT, NUMBER, STRING, BOOLEAN, FUNCTION, ARRAY} = require('./lib/matcher');
const mock = require('./lib/mock');

module.exports = {
  Mock: mock.Mock,
  UnexpectedCall: mock.UnexpectedCall,
  Matcher: {ANY, OBJECT, NUMBER, STRING, BOOLEAN, FUNCTION, ARRAY}
}