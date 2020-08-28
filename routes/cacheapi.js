const express = require('express');
const mongoose = require('mongoose');
const api = require('../cache');
const router = express.Router();

/* GET home page. */
router.get('/keys/:key', async function(req, res, next) {
  try {
    const value = await api.getItem(req.params.key);
    res.status(200).send(value);
  } 
  catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;