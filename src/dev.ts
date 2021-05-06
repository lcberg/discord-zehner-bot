import { createConnection } from 'typeorm';
import OPService from './OPService';
import BotMessageService from './Services/BotMessageService';

import config from '../src/config';

const os = new OPService();

async function init () {
    await os.setup();

    await os.getUserScores('LLouis');
}

async function dbtest () {
    const connection = await createConnection();

    console.log(connection.isConnected)
}

//init();

//dbtest();

async function runBot() {
    const bms = new BotMessageService();
    await bms.registerMessageHandlers();
}

runBot();