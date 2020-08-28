const express = require('express');
const mongoose = require('mongoose');
const api = require('../cache');
const router = express.Router();

const options = {
  connectionString: "mongodb://127.0.0.1:27017/test",
  cacheSize: 5,
  expiresAfter: 60,
  shrinkBy: 3
};

router.get('/keys/:key', async function(req, res, next) {
  try {
    const value = await api.getItem(req.params.key, options);
    res.status(200).send(value);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

router.get('/keys', async function(req, res, next) {
  try {
    const keys = await api.getKeys();
    res.status(200).send(keys);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/keys/:key', async function(req, res, next) {
  try {
    await api.removeItem(req.params.key);
    res.sendStatus(200);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/keys', async function(req, res, next) {
  try {
    await api.removeAll();
    res.sendStatus(200);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

router.post('/keys', async function(req, res, next) {
  try {
    if (req.is('application/json')) {
      await api.updateItem(req.body);
      res.sendStatus(200);
    } else {
      res.sendStatus(406);
    }
  } 
  catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;