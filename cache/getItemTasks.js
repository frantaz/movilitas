const R = require('ramda');
const Task = require('folktale/concurrency/task');
const Item = require('../model/cache');
const { log } = require('../utils');
const { saveT, itemCountT } = require('./commonTasks');
const { renewItem, hasExpired, isFull } = require('./common');
const { removeOldestItemsT, removeExpiredItemsT } = require('./removeItems');

// renewAndSaveT :: Item -> Task Error Item
const renewAndSaveT = R.compose(
  saveT,
  renewItem
);

// renewIfExpiredT :: Item -> Task Error Item
const renewIfExpiredT = R.ifElse(hasExpired,
  R.compose(renewAndSaveT, log("Cache miss")),
  R.compose(Task.of, log("Cache hit"))
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
  checkIfFullThenRemoveT
}
