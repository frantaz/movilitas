const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json();
});

module.exports = router;