const R = require('ramda');
const Task = require('folktale/concurrency/task');
const Item = require('../model/cache');
const { createString } = require('./common');

// findOneByKeyT :: String -> Task Error Item
const findOneByKeyT = Task.fromPromised(key => Item.findOne({key}).exec());

// saveT :: Item -> Task Error Item
const saveT = Task.fromPromised(item => item.save());

// create :: String -> Item
const create = (key) => new Item({key, value: createString(), createdAt: new Date()});

// createItemT :: String -> Task Error Item
const createItemT = R.compose(saveT, create);

// deleteItemsT :: List -> Task Error Object
const deleteItemsT = Task.fromPromised(xs => Item.deleteMany({_id: { $in: xs.map(i => i._id) } }).exec());

// itemCountT :: () -> Task Error Number
const itemCountT = Task.fromPromised(() => Item.countDocuments({}).exec());


module.exports = {
  findOneByKeyT,
  saveT,
  createItemT,
  deleteItemsT,
  itemCountT
};
