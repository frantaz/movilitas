const R = require('ramda');
const Task = require('folktale/concurrency/task');
const Item = require('../model/cache');
const { deleteItemsT } = require('./commonTasks');

// removeOldestItemsT :: Number -> Task Error Number
const removeOldestItemsT = R.compose(
  R.chain(deleteItemsT),
  Task.fromPromised((count) => Item.find().sort({createdAt: 1}).limit(count).exec())
);

// removeExpiredItemsT :: Number -> Task Error Number
const removeExpiredItemsT = R.compose(
  R.chain(R.ifElse(R.isEmpty, R.always(Task.of({ deletedCount: 0 })), deleteItemsT)),
  Task.fromPromised((lifeTime) => Item.find({ createdAt: { $lt: new Date() - lifeTime * 1000 } }).exec())
);

module.exports = {
  removeExpiredItemsT,
  removeOldestItemsT,
}