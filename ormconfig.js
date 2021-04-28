const rootDir = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' ?
    '/src' :
    '/build'

const entitiesDir = __dirname + rootDir + '/models/**/*{.js,.ts}';

console.log(`entities ${entitiesDir}`);

if(process.env.NODE_ENV === 'development') {
    const config = require ('./src/config');
    console.log('loaded dev config');
} else {
    const config = require ('./build/config');
    console.log('loaded build config');
}

const config = {
    name: 'default',
    "type": "postgres",
    "host": process.env.DATABASE_HOST,
    "port": process.env.DATABASE_PORT,
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_DATABASE,
    entities: [
        __dirname + rootDir + '/models/**/*{.js,.ts}'
    ],
    migrations: [
        __dirname + rootDir + '/database/migrations/**/*{.ts,.js}'
    ],
    cli: {
        migrationsDir: 'src/database/migrations'
    },
    synchronize: false,
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    ssl: true
}

console.log(config);

module.exports = config;