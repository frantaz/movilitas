const connect = require('./model/db');
const config = require('./config');
const express = require('express');
const logger = require('morgan');

var apiRouter = require('./routes/cacheapi');

var app = express();
const port = 3000;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRouter);

connect(config["connectionString"]).then(() => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
})
.catch((err) => {
  console.error(err);
});

module.exports = app;
