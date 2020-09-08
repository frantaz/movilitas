const config = {
  connectionString: "mongodb://127.0.0.1:27017/test",
  cacheSize: 5,
  lifeTime: 60, // seconds
  shrinkBy: 3
}

module.exports = config;