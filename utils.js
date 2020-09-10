const R = require('ramda');

// trace :: String -> Object -> Object
const trace = R.curry((tag, x) => {
  console.log(tag, x);
  return x;
});

// log :: String -> Object -> Object
const log = R.curry((msg, x) => {
  console.log(msg);
  return x;
});

module.exports = {
  log,
  trace
};