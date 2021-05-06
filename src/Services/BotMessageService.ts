import Discord from 'discord.js';
import { getConnection, getCustomRepository } from 'typeorm';
import gameListener from '../Features/betting/GameManager';
import { DiscordUserRepository } from '../database/repositories/DiscordUserRepository';
import RequestManager from '../Features/Requests/RequestManager';

export default class BotMessageService {
    private client: Discord.Client;
    private RequestManager: RequestManager;

    constructor() {
        this.client = new Discord.Client();
        this.RequestManager = new RequestManager();
        //this.client.login(process.env.DISCORD_TOKEN).then(() => console.log('client ready'));
    }

    public async registerMessageHandlers() {
        const connection = getConnection();
        const repo = getCustomRepository(DiscordUserRepository);

        this.client.on('message', async message => {
            console.log('message received');

            if (message.content.toLocaleLowerCase().includes('franz')) await message.reply('kleiner schwanz :)');
            if (message.content.toLocaleLowerCase().includes('swift')) await message.reply('sogar Java ist besser als swift.');

            if (message.channel.id === process.env.CHANNEL_ID && message.content.startsWith('!zehner')) {
                const content = message.content.replace('!zehner', '').trim();
                if (!(content.length > 0)) {
                    message.reply('nice typing idiot...');
                    return;
                }

                if(content.startsWith('bet ')) {
                    console.log('was betting message');
                    gameListener(message, this.client);
                } else if (content === 'register') {
                    if (!await repo.userExists(message.author.id)) {
                        await repo.createAndSave(message.author.id, message.author.username);
                        message.react('✅');
                    } else message.reply('Atze du bist schon registriert...');
                } else if (content.startsWith('points')) {
                    await this.RequestManager.pointRequest(message);
                }


            }
        });

        this.client.on('ready', () => console.log(`Client logged in as ${this.client.user?.tag}`));
        console.log(process.env.DISCORD_TOKEN);
        await this.client.login(process.env.DISCORD_TOKEN);
    }
    


}