const Item = require('./model/cache');
const config = require('./config');

const createString = () => Math.random().toString(36).substr(2, 10);

const hasExpired = (item, expireMillisec) => new Date() - item.createdAt > expireMillisec;

async function getItem(key) {
    const item = await find(key);
    if (item) {
      return item;
    }

    return createItem(key);
}

async function find(key)
{
  const expiresAfter = config["expiresAfter"];
  const cacheSize = config["cacheSize"];
  const item = await Item.findOne({key});

  console.log(`Item ${item}`);
  if (item)
  {
    if (hasExpired(item, expiresAfter * 1000)) {
      console.log(`Expired`);
      const updatedItem = await update(item);
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

async function update(item)
{
  item.value = createString();
  item.createdAt = new Date();
  const newitem = await item.save();
  console.log(`Cache miss`);
  return newitem;
}

async function removeSomeItems()
{
  console.log('Remove some items');
  const shrinkBy = config["shrinkBy"];
  const expiredItems = await Item.find({ createdAt: { $lt: new Date() - config.expiresAfter * 1000 } });
  if (expiredItems.length > 0)
  {
    await Item.deleteMany({_id: { $in: expiredItems.map(i => i._id) } });
  } else {
    const oldestItems = await Item.find().sort({createdAt: 1}).limit(shrinkBy);
    await Item.deleteMany({_id: { $in: oldestItems.map(i => i._id) } });
  }
}

async function getKeys() {
  const items = await Item.find();
  return items.map(i => i.key);
}

async function removeItem(key)
{
  const item = await Item.findOne({key});
  if (item)
  {
    await Item.deleteOne({key});
  }
}

async function removeAll()
{
  await Item.deleteMany();
}

async function updateItem({key, value})
{
  const item = await Item.findOne({key});
  if (item)
  {
    item.key = key;
    item.value = value;
    item.createdAt = new Date();
    await item.save();
  }
}

module.exports = {
  getItem,
  getKeys,
  removeItem,
  removeAll,
  updateItem
};