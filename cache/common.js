const R = require('ramda');
const config = require('../config');

const lifeTime = config["lifeTime"];
const cacheSize = config["cacheSize"];

const isFull = R.lte(cacheSize);

// renewItem :: Item -> Item
const renewItem = (item) => Object.assign(item, {
  value: createString(),
  createdAt: new Date()
});

// createString :: () -> String
const createString = () => Math.random().toString(36).substr(2, 10);

// hasExpired :: Number -> (() -> Date) -> Date -> Bool
const hasExpiredAfter = R.curry((expireMillisec, nowFn, from) => nowFn() - from > expireMillisec);

const hasExpired = R.compose(hasExpiredAfter(lifeTime * 1000)(() => new Date()), R.prop("createdAt"));

module.exports = {
  isFull,
  renewItem,
  createString,
  hasExpiredAfter,
  hasExpired
}