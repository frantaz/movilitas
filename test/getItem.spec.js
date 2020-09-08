const Task = require('folktale/concurrency/task');
const Item = require('../model/cache');
const GT = require('../cache/getItemTasks');
const CT = require('../cache/commonTasks');
const getItem = require('../cache/getItem');
const config = require('../config');

jest.mock('../cache/getItemTasks');
jest.mock('../cache/commonTasks');

describe("getItem() test", () => {
  const item1 = new Item({key: "test1", value: "v1", createdAt: new Date()});
  
  test("create if item not exists", async () => {

    GT.checkIfFullThenRemoveT.mockImplementation(Task.fromPromised((_) => Promise.resolve(null) ));
    CT.findOneByKeyT.mockImplementation(Task.fromPromised(() => Promise.resolve(undefined)));
    CT.createItemT.mockImplementation(Task.fromPromised(() => Promise.resolve(item1)));

    const value = await getItem("test1").run().promise();
    expect(value).toBe(item1);
  });

  test("return existing item if it exists", async () => {
      const renewIfExpiredTCalled = jest.fn(x => x);
  
      GT.renewIfExpiredT.mockImplementation(Task.fromPromised((item) => { 
        renewIfExpiredTCalled(true);
        return  Promise.resolve(item) 
      }));
      CT.findOneByKeyT.mockImplementation(Task.fromPromised(() => Promise.resolve(item1)));
  
      const value = await getItem("test1").run().promise();
      expect(value).toBe(item1);
      expect(renewIfExpiredTCalled.mock.calls.length == 1 && renewIfExpiredTCalled.mock.results[0].value).toBe(true);  
    });

  test("always check if cache is full when item is not found", async () => {
    const fullCheckCalled = jest.fn(x => x);

    GT.checkIfFullThenRemoveT.mockImplementation(Task.fromPromised((_) => { 
      fullCheckCalled(true);
      return  Promise.resolve(undefined); 
    } ));
    CT.findOneByKeyT.mockImplementation(Task.fromPromised(() => Promise.resolve(undefined)));
    CT.createItemT.mockImplementation(Task.fromPromised(() => Promise.resolve(item1)));

    const value = await getItem("test1").run().promise();
    
    expect(fullCheckCalled.mock.results[0].value && fullCheckCalled.mock.calls.length == 1).toBe(true);
  });
});
