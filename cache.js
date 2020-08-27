const mongoose = require('mongoose');
const { default: to } = require('await-to-js');
const Schema = mongoose.Schema;

const resultOk = "Ok";

const config = {
  connectionString: "",
  cacheSize: 100,
  expiresAfter: 10 // minutes
}

const cacheSchema = new Schema({
    key: String,
    value: String,
    createdAt: Date
});

// compile our model
const Item = mongoose.model('Cache', cacheSchema);

const createString = () => Math.random().toString(36).substr(2, 10);

const hasErr = (itemWithErr) => itemWithErr[1] != resultOk;

async function getItem(key) {
  const itemWithErr = find(key);
  if (hasErr(itemWithErr[1])) return itemWithErr;

  console.log(`Cache ${item ? "hit" : "miss"}`);

  if (itemWithErr[0]) return itemWithErr;

  return createItem();
}

async function find(key)
{
  const [err, item] = await to(Item.findOne({key}));
  if (err) {
    console.log(`Error at mongodb: ${err}`);
    return ["", err];
  }

  return [item.value, resultOk];
}

async function createItem()
{
  const newItem = new Item({key, value: createString(), createdAt: new Date()});
  const [err, item] = await to(newItem.save());
  if (err) {
    console.log(`Error at mongodb: ${err}`);
    return ["", err];
  }
  return [newItem, resultOk];
}

module.exports = {
  getItem,
  hasErr
};