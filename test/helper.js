'use strict';

exports.create = function(T) {
  return new (Function.prototype.bind.apply(T, arguments));
};