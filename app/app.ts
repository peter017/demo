import express = require('express');
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FlatService } from './service/FlatService';
import credentials from './config/credentials';
import db from './config/db';
dotenv.config();


const bootup = async () => {
  await db.createDbConnection();
  console.log('done');
  // Create a new express application instance
  const app: express.Application = express();
  const flatService: FlatService = new FlatService();
  
  app.get('/', function (req, res) {
    res.send('Hello World!');
  });
  
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  
    flatService.loadCurrentFlats();
  });
  
  var opts = {
       server: {
          socketOptions: {keepAlive: 1}
       }
  };
}

bootup();