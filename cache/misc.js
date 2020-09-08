const Task = require('folktale/concurrency/task');
const R = require('ramda');
const Item = require('../model/cache');
const { findOneByKeyT, saveT } = require('./commonTasks');

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
  getKeys,
  removeItem,
  removeAll,
  updateItem
};