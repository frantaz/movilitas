const express = require('express');
const getItem = require('../cache/getItem');
const { getKeys, updateItem, removeItem, removeAll} = require('../cache/misc');
const router = express.Router();

router.get('/keys/:key', async function(req, res, next) {
  try {
    const value = await getItem(req.params.key).run().promise();
    res.status(200).send(value);
  } 
  catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/keys', async function(req, res, next) {
  try {
    const keys = await getKeys().run().promise();
    res.status(200).send(keys);
  } 
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.delete('/keys/:key', async function(req, res, next) {
  try {
    await removeItem(req.params.key);
    res.sendStatus(200);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/keys', async function(req, res, next) {
  try {
    await removeAll();
    res.sendStatus(200);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

router.post('/keys', async function(req, res, next) {
  try {
    if (req.is('application/json')) {
      await updateItem(req.body).run().promise();
      res.sendStatus(200);
    } else {
      res.sendStatus(406);
    }
  } 
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});


module.exports = router;