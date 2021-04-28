import "reflect-metadata";
import { createConnection } from "typeorm";

import { TEST } from './config';
console.log(TEST);
import BotMessageService from './Services/BotMessageService';

const send = true;


async function init() {
    const connection = await createConnection();
    
    const bms = new BotMessageService();
    bms.registerMessageHandlers();
    
}

init();