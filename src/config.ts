import * as dotenv from 'dotenv';

    //dotenv.config();
    let path;
    switch (process.env.NODE_ENV) {
      case "test":
        path = `${__dirname}/../.env.test`;
        console.log('loading test env');
        break;
      case "production":
        path = `${__dirname}/../.env.production`;
        console.log('loading prod env');
        break;
      default:
        console.log('loading dev env');
        path = `${__dirname}/../.env.development`;
        console.log(path);
    }
    dotenv.config({ path: path });

    console.log('Finished env setup');

export const TEST = process.env.DATABASE_HOST;

export default this;
