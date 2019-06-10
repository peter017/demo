import { FlatResource } from './resources/FlatResource';
import express, { Router } from 'express';
import db from './config/db';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FlatService } from './service/FlatService';
import credentials from './config/credentials';
import { Flat } from './domain/Flat';
dotenv.config();

// Create a new express application instance
export const app: express.Application = express();

const bootup = async () => {
  await db.createDbConnection();
  console.log('done');
  
  const flatService: FlatService = new FlatService();

          
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    let flatResource: Router = new FlatResource(flatService).getRouter();
    app.use('/flats', flatResource);
  });

  var opts = {
       server: {
          socketOptions: {keepAlive: 1}
       }
  };
};

bootup();

// export default app;