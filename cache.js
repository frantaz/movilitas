const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultOk = "Ok";

const config = {
  connectionString: "mongodb://127.0.0.1:27017/test",
  cacheSize: 100,
  expiresAfter: 600 // seconds
}

const cacheSchema = new Schema({
    key: String,
    value: String,
    createdAt: Date
});

// compile our model
const Item = mongoose.model('cache', cacheSchema);

const createString = () => Math.random().toString(36).substr(2, 10);

const hasExpired = (item, expireMillisec) => new Date() - item.createdAt > expireMillisec;

async function getItem(key) {
  let db = null;
  try {
    let resp;
    await mongoose.connect(config.connectionString, { useNewUrlParser: true });
    db = mongoose.connection;

    const item = await find(key);
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

async function find(key)
{
  item = await Item.findOne({key});
  if (item)
  {
    if (hasExpired(item, config.expiresAfter * 1000)) {
      return await updateItem(item);
    }
    else {
      console.log(`Cache hit`);
      return item;
    }
  }
  
  count = await Item.estimatedDocumentCount({key});
  if (count > config.cacheSize)
  {
    removeSomeItems(10);
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

async function removeSomeItems(minNumberofRemove)
{
  count = await Item.estimatedDocumentCount({ createdAt: { $lt: new Date() - config.expiresAfter * 1000 } });
  if (count > 0)
  {
    await Item.deleteMany({ createdAt: { $lt: new Date() - config.expiresAfter * 1000 } });
  } else
  {
    const items = await Item.find().sort({createdAt: 1}).limit(minNumberofRemove);
    await Item.remove({_id: { $in: items.map(i => i._id) } });
  }
}

module.exports = {
  getItem
};