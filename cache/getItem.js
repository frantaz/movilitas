const R = require('ramda');
const config = require('../config');
const { log } = require('../utils');
const { createItemT, findOneByKeyT } = require('./commonTasks');
const { checkIfFullThenRemoveT, renewIfExpiredT } = require('./getItemTasks')

const lifeTime = config["lifeTime"];
const cacheSize = config["cacheSize"];
const shrinkBy = config["shrinkBy"];

// getItem :: String -> Task Error Item
const getItem = (key) => R.compose(
  R.chain(
    R.ifElse(R.identity,
      renewIfExpiredT,
      R.compose(
        R.chain(R.always(createItemT(key))), 
        R.always(checkIfFullThenRemoveT({ cacheSize, lifeTime, shrinkBy })),
        log('Cache miss'))
    )  
  ),
  findOneByKeyT
)(key);

module.exports = getItem;