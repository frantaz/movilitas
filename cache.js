const mongoose = require('mongoose');
const { options } = require('./app');
const Schema = mongoose.Schema;

const resultOk = "Ok";

const config = {
  connectionString: "mongodb://127.0.0.1:27017/test",
  cacheSize: 100,
  expiresAfter: 120, // seconds
  shrinkBy: 10
}

const cacheSchema = new Schema({
    key: String,
    value: String,
    createdAt: Date
});

const Item = mongoose.model('cache', cacheSchema);

const createString = () => Math.random().toString(36).substr(2, 10);

const hasExpired = (item, expireMillisec) => new Date() - item.createdAt > expireMillisec;

const getConfig = (options, prop) => (options && options[prop]) || config[prop];

async function getItem(key, options) {
  let db = null;
  try {
    const connStr = getConfig(options, "connectionString");

    let resp;

    await mongoose.connect(connStr, { useNewUrlParser: true });
    db = mongoose.connection;

    const item = await find(key, options);
    if (item) resp = item;
    else resp = await createItem(key);
    
    db.close();

    return resp.value;
  } catch (err) {
      (db) && db.close();
      console.log('Error at db ::', err)
      throw err;
  }
}

async function find(key, options)
{
  const expiresAfter = getConfig(options, "expiresAfter");
  const cacheSize = getConfig(options, "cacheSize");
  item = await Item.findOne({key});
  console.log(`Item ${item}`);
  if (item)
  {
    if (hasExpired(item, expiresAfter * 1000)) {
      const updatedItem = await updateItem(item);
      await removeSomeItems(options);
      return updatedItem;
    }
    else {
      console.log(`Cache hit`);
      return item;
    }
  }
  
  const count = await Item.countDocuments();
  if (count >= cacheSize)
  {
    await removeSomeItems(options);
  }
  
  return "";
}

async function createItem(key)
{
  const newItem = new Item({key, value: createString(), createdAt: new Date()});
  const item = await newItem.save();
  console.log(`Cache miss`);
  return item;
}

async function updateItem(item)
{
  item.value = createString();
  item.createdAt = new Date();
  item = await item.save();
  console.log(`Cache miss`);
  return item;
}

async function removeSomeItems(options)
{
  const shrinkBy = getConfig(options, "shrinkBy");
  const expiredItems = await Item.find({ createdAt: { $lt: new Date() - config.expiresAfter * 1000 } });
  if (expiredItems.length > 0)
  {
    var q = await Item.deleteMany({_id: { $in: expiredItems.map(i => i._id) } });
  } else {
    const oldestItems = await Item.find().sort({createdAt: 1}).limit(shrinkBy);
    var q = await Item.deleteMany({_id: { $in: oldestItems.map(i => i._id) } });
  }
}

async function getKeys() {
  let db = null;
  try {
    const connStr = getConfig(options, "connectionString");

    let resp;

    await mongoose.connect(connStr, { useNewUrlParser: true });
    db = mongoose.connection;

    const items = await Item.find();
    
    db.close();

    return items.map(i => i.key);
  } catch (err) {
      (db) && db.close();
      console.log('Error at db ::', err)
      throw err;
  }
}

module.exports = {
  getItem,
  getKeys
};