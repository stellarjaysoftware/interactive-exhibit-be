const mongoose = require('mongoose');
const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "exhibit-api";

mongoose.connect(`${connectionUrl}/${databaseName}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: true
});
