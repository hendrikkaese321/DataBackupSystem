require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const apiRoutes = require('./rndirectory to your routes fileoutes');
const server = express();
server.use(bodyParser.json());
mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connection established successfully.'))
.catch(err => console.error('Failed to connect to MongoDB: ', err));
server.use('/api', apiRoutes);
const SERVER_PORT = process.env.PORT || 3000;
server.listen(SERVER_PORT, () => {
  console.log(`Server is up and running on port ${SERVER_PORT}.`);
});