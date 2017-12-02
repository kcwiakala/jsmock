'use strict';

exports.assert = (val, message) => {
  if(!val) {
    throw new Error(message);
  }
}

exports.type = (val, expected, message) => {
  if (typeof val !== expected) {
    throw new TypeError(message)
  }
}