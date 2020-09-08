const R = require('ramda');
const Task = require('folktale/concurrency/task');
const config = require('../config');
const Item = require('../model/cache');
const { hasExpiredAfter, log, createString } = require('../utils');
const { saveT, itemCountT, deleteItemsT } = require('./commonTasks');
const { renewItem, hasExpired, isFull } = require('./common');

// renewAndSaveT :: Item -> Task Error Item
const renewAndSaveT = R.compose(
  saveT,
  renewItem
);

// renewIfExpiredT :: Item -> Task Error Item
const renewIfExpiredT = R.ifElse(hasExpired,
  R.compose(renewAndSaveT, log("Cache miss, renewed")),
  R.compose(Task.of, log("Cache hit"))
);

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

// checkIfFullThenRemoveT :: ({ cacheSize, lifeTime, shrinkBy }) -> Task Error ()
const checkIfFullThenRemoveT = ({ cacheSize, lifeTime, shrinkBy }) => R.compose(
  R.chain(R.ifElse(isFull,
    R.compose(
      R.chain(R.ifElse(R.compose(R.lt(0), R.prop('deletedCount')), Task.of, R.always(removeOldestItemsT(shrinkBy)))), 
      R.always(removeExpiredItemsT(lifeTime))
    ),
    Task.of
  )),
  itemCountT
)({ cacheSize, lifeTime, shrinkBy });


module.exports = {
  renewAndSaveT,
  renewIfExpiredT,
  removeOldestItemsT,
  removeExpiredItemsT,
  checkIfFullThenRemoveT
}
