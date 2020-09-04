const Task = require('folktale/concurrency/task');
const Maybe = require('folktale/maybe');
const R = require('ramda');
const Item = require('./model/cache');
const config = require('./config');

const expiresAfter = config["expiresAfter"];
const cacheSize = config["cacheSize"];
const shrinkBy = config["shrinkBy"];

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

// createString :: () -> String
const createString = () => Math.random().toString(36).substr(2, 10);

// hasExpired :: Number -> Item -> Bool
const hasExpired = R.curry((expireMillisec, item) => new Date() - item.createdAt > expireMillisec);

// create :: String -> Item
const create = (key) => new Item({key, value: createString(), createdAt: new Date()});

// findOneByKeyT :: String -> Task Error Item
const findOneByKeyT = Task.fromPromised(key => Item.findOne({key}).exec());

// saveT :: Item -> Task Error Item
const saveT = Task.fromPromised(item => item.save());

// itemCountT :: () -> Task Error Number
const itemCountT = Task.fromPromised((_) => Item.countDocuments({}).exec());

// renewItem :: Item -> Item
const renewItem = (item) => Object.assign(item, {
  value: createString(),
  createdAt: new Date()
});

// renewAndSave :: Item -> Task Error Item
const renewAndSave = R.compose(
  saveT,
  renewItem
);

// updateIfExpired :: Item -> Task Error Item
const updateIfExpired = R.ifElse(hasExpired(expiresAfter * 1000),
  R.compose(renewAndSave, log("Cache miss, renewed")),
  R.compose(Task.of, log('Cache hit'))
);

// find :: String -> Task Error Item
const find = R.compose(
  R.chain(R.ifElse(R.identity, updateIfExpired, Task.of)),
  findOneByKeyT
);

// createItemT :: String -> Task Error Item
const createItemT = R.compose(saveT, create);

// grtItem :: String -> Task Error Item
const getItem = (key) => R.compose(
  R.chain(
    R.ifElse(R.identity,
    Task.of,
    R.compose(
      R.chain(R.always(createItemT(key))), 
      R.always(checkIfFullThenRemove({ size: cacheSize, lifeTime: expiresAfter, shrinkBy })),
      log('Cache miss')),
  )),
  find
)(key);

const deletetItemsT = Task.fromPromised(xs => Item.deleteMany({_id: { $in: xs.map(i => i._id) } }).exec());

// removeOldestItemsT :: Number -> Task Error Number
const removeOldestItemsT = R.compose(
  R.chain(deletetItemsT),
  Task.fromPromised((count) => Item.find().sort({createdAt: 1}).limit(count).exec())
);

// removeExpiredItemsT :: Number -> Task Error Number
const removeExpiredItemsT = R.compose(
  R.chain(R.ifElse(R.isEmpty, R.always(Task.of({ deletedCount: 0 })), deletetItemsT)),
  Task.fromPromised((lifeTime) => Item.find({ createdAt: { $lt: new Date() - lifeTime * 1000 } }).exec())
);

// checkIfFullThenRemove :: ({ size, lifeTime, shrinkBy }) -> Task Error ()
const checkIfFullThenRemove = ({ size, lifeTime, shrinkBy }) => R.compose(
  R.chain(R.ifElse(R.lte(size),
    R.compose(
      R.chain(R.ifElse(R.compose(R.lt(0), R.prop('deletedCount')), Task.of, R.always(removeOldestItemsT(shrinkBy)))), 
      R.always(removeExpiredItemsT(lifeTime))
    ),
    Task.of
  )),
  itemCountT
)({ size, lifeTime, shrinkBy });

const getKeys = R.compose(
  R.map(R.map(i => i.key)),
  Task.fromPromised(() => Item.find().exec())
);

const removeItem = async (key) => await Item.deleteOne({ key }).exec();

const removeAll = async () => await Item.deleteMany().exec();

const updateItem = ({ key, value }) =>
  R.compose(
    R.chain(
      R.ifElse(R.identity, 
        R.compose(saveT, item => Object.assign(item, { value, createdAt: new Date() })),
        Task.of)),
    R.compose(findOneByKeyT, R.prop('key'))
  )({ key, value });

module.exports = {
  getItem,
  getKeys,
  removeItem,
  removeAll,
  updateItem
};