var mongoose = require( 'mongoose' );

async function connect(connStr) {

  await mongoose.connect(connStr, { useNewUrlParser: true });

  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + connStr);
  });

  mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
  });

  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
  });

  process.on('SIGINT', function() {
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });

  return mongoose;
}

module.exports = connect;

