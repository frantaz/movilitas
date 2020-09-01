const mongoose = require('mongoose');

const cacheSchema = new mongoose.Schema({
  key: String,
  value: String,
  createdAt: Date
});

module.exports = mongoose.model('cache', cacheSchema);