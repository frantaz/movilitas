const Task = require('folktale/concurrency/task');
const Item = require('../model/cache');

beforeEach(() => {
  jest.resetModules();
  console.log = jest.fn((...args) => args);
});

describe("getItemTasks  tests", () => { 
  const item1 = new Item({key: "t1", value: "v1", createdAt: new Date()});
  const itemRenewed = Object.assign(item1, { createdAt: new Date() + 1000 });
  
  describe("renewIfExpiredT", () => {
    test("renew expired item and log 'Cache miss'", async () => {
      jest.mock('../cache/commonTasks');
      jest.mock('../cache/common', () => {
        const originalModule = jest.requireActual('../cache/common');
        return {
          __esModule: true,
          ...originalModule,
          renewItem: jest.fn(),
          hasExpired: jest.fn(),
        };
      });
      const common = require('../cache/common');
      const CT = require('../cache/commonTasks');
      const GT = require('../cache/getItemTasks');

      common.hasExpired.mockImplementation(_ => true);
      common.renewItem.mockImplementation(_ => itemRenewed);
      CT.saveT.mockImplementation(Task.fromPromised(item => Promise.resolve(item)));

      const value = await GT.renewIfExpiredT(item1).run().promise();

      expect(value === itemRenewed).toBeTruthy();
      expect(console.log.mock.calls[0][0]).toBe('Cache miss');
    });

    test("doesn't touch not expired one and log 'Cache hit'", async () => {
      jest.mock('../cache/commonTasks');
      jest.mock('../cache/common', () => {
        const originalModule = jest.requireActual('../cache/common');
        return {
          __esModule: true,
          ...originalModule,
          renewItem: jest.fn(),
          hasExpired: jest.fn(),
        };
      });
      const common = require('../cache/common');
      const CT = require('../cache/commonTasks');
      const GT = require('../cache/getItemTasks');

      common.hasExpired.mockImplementation(_ => false);
      common.renewItem.mockImplementation(_ => itemRenewed);
      CT.saveT.mockImplementation(Task.fromPromised(item => Promise.resolve(item)));

      const value = await GT.renewIfExpiredT(item1).run().promise();

      expect(value === item1).toBeTruthy();
      expect(console.log.mock.calls[0][0]).toBe('Cache hit');
    });
  });

  describe("checkIfFullThenRemoveT should remove some items", () => {
    test("if cache is full then first try to remove expired items", async () => {
      const currCacheSize = 8;
      jest.mock('../cache/commonTasks');
      jest.mock(('../cache/removeItems'));
      jest.mock('../config.js', () => {
        const originalModule = jest.requireActual('../config');
        return {
          __esModule: true,
          ...originalModule,
          cacheSize: 7,
        };
      });
      jest.mock('../cache/common', () => {
        const originalModule = jest.requireActual('../cache/common');
        return {
          __esModule: true,
          ...originalModule,
          renewItem: jest.fn(),
        };
      });
      const config = require('../config');
      const { removeExpiredItemsT, removeOldestItemsT} = require('../cache/removeItems');
      const common = require('../cache/common');
      const CT = require('../cache/commonTasks');
      const GT = require('../cache/getItemTasks');

      const expiredItemCount = { deletedCount: 2 };
      
      const removeExpiredCalled = jest.fn();
      const removeOldestCalled = jest.fn();
      common.renewItem.mockImplementation(_ => itemRenewed);
      CT.itemCountT.mockImplementation(Task.fromPromised(_ => Promise.resolve(currCacheSize)));
      removeExpiredItemsT.mockImplementation(Task.fromPromised(_ => { removeExpiredCalled(); return Promise.resolve(expiredItemCount) }));
      removeOldestItemsT.mockImplementation(Task.fromPromised(_ => { removeOldestCalled(); return Promise.resolve({ deletedCount: 0 }) }));

      await GT.checkIfFullThenRemoveT({}).run().promise();

      expect(removeExpiredCalled.mock.calls.length).toBe(1);
      expect(removeOldestCalled.mock.calls.length).toBe(0);
    });

    test("if there is no expired item then remove the oldest ones", async () => {
      jest.mock('../cache/commonTasks');
      jest.mock(('../cache/removeItems'));
      jest.mock('../config.js', () => {
        const originalModule = jest.requireActual('../config');
        return {
          __esModule: true,
          ...originalModule,
          cacheSize: 7,
        };
      });
      jest.mock('../cache/common', () => {
        const originalModule = jest.requireActual('../cache/common');
        return {
          __esModule: true,
          ...originalModule,
          renewItem: jest.fn(),
        };
      });
      const config = require('../config');
      const { removeExpiredItemsT, removeOldestItemsT} = require('../cache/removeItems');
      const common = require('../cache/common');
      const CT = require('../cache/commonTasks');
      const GT = require('../cache/getItemTasks');

      const currCacheSize = 8;
      const expiredItemCount = { deletedCount: 0 };
      
      const removeExpiredCalled = jest.fn();
      const removeOldestCalled = jest.fn();
      common.renewItem.mockImplementation(_ => itemRenewed);
      CT.itemCountT.mockImplementation(Task.fromPromised(_ => Promise.resolve(currCacheSize)));
      removeExpiredItemsT.mockImplementation(Task.fromPromised(_ => { removeExpiredCalled(); return Promise.resolve(expiredItemCount) }));
      removeOldestItemsT.mockImplementation(Task.fromPromised(_ => { removeOldestCalled(); return Promise.resolve({ deletedCount: 3 }) }));

      await GT.checkIfFullThenRemoveT({}).run().promise();

      expect(removeExpiredCalled.mock.calls.length).toBe(1);
      expect(removeOldestCalled.mock.calls.length).toBe(1);
    });

    test("if cache is not full then just passing the item forward", async () => {
      jest.mock('../cache/commonTasks');
      jest.mock(('../cache/removeItems'));
      jest.mock('../config.js', () => {
        const originalModule = jest.requireActual('../config');
        return {
          __esModule: true,
          ...originalModule,
          cacheSize: 7,
        };
      });
      jest.mock('../cache/common', () => {
        const originalModule = jest.requireActual('../cache/common');
        return {
          __esModule: true,
          ...originalModule,
          renewItem: jest.fn(),
        };
      });
      const config = require('../config');
      const { removeExpiredItemsT, removeOldestItemsT} = require('../cache/removeItems');
      const common = require('../cache/common');
      const CT = require('../cache/commonTasks');
      const GT = require('../cache/getItemTasks');

      const currCacheSize = 3;
      const expiredItemCount = { deletedCount: 0 };
      
      const removeExpiredCalled = jest.fn();
      const removeOldestCalled = jest.fn();
      common.renewItem.mockImplementation(_ => itemRenewed);
      CT.itemCountT.mockImplementation(Task.fromPromised(_ => Promise.resolve(currCacheSize)));
      removeExpiredItemsT.mockImplementation(Task.fromPromised(_ => { removeExpiredCalled(); return Promise.resolve(expiredItemCount) }));
      removeOldestItemsT.mockImplementation(Task.fromPromised(_ => { removeOldestCalled(); return Promise.resolve({ deletedCount: 3 }) }));

      await GT.checkIfFullThenRemoveT({}).run().promise();

      expect(removeExpiredCalled.mock.calls.length).toBe(0);
      expect(removeOldestCalled.mock.calls.length).toBe(0);
    });
  });
});
