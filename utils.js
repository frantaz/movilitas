const R = require('ramda');

// createString :: () -> String
const createString = () => Math.random().toString(36).substr(2, 10);

// hasExpired :: Number -> (() -> Date) -> Date -> Bool
const hasExpiredAfter = R.curry((expireMillisec, nowFn, from) => nowFn() - from > expireMillisec);

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
  createString,
  hasExpiredAfter,
  log,
  trace
};