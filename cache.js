const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultOk = "Ok";

const config = {
  connectionString: "mongodb://localhost/test",
  cacheSize: 100,
  expiresAfter: 600 // seconds
}

const cacheSchema = new Schema({
    key: String,
    value: String,
    createdAt: Date
});

// compile our model
const Item = mongoose.model('Cache', cacheSchema);

const createString = () => Math.random().toString(36).substr(2, 10);

const hasExpired = (item, expireMillisec) => new Date() - item.createdAt > expireMillisec;

async function getItem(key) {
  let db = null;
  try {
    const resp;
    await mongoose.connect(config.connectionString, { useNewUrlParser: true });
    db = mongoose.connection;

    const item = await find(key);
    if (item) resp = item;
    else resp = await createItem();
    
    db.close();

    return resp;
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
      return item.value;
    }
  }
  
  count = await Item.estimatedDocumentCount({key});
  if (count > config.cacheSize)
  {
    removeSomeItems(10);
  }
  
  return "";
}

async function createItem()
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
  const item = await item.save();
  console.log(`Cache miss`);
  return item.value;
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
  });
  }
}

module.exports = {
  getItem
};