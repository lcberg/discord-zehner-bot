import { Connection, getConnection, getCustomRepository } from "typeorm";
import { DiscordUserRepository } from "../../database/repositories/DiscordUserRepository";
import { GameStatsRepository } from "../../database/repositories/GameStatsRepository";
import { OpScoreRepository } from "../../database/repositories/OpScoreRepository";
import Discord from 'discord.js';
import { DiscordUser } from "../../models/DiscordUser";

export default class RequestManager {
    private connection: Connection;
    private UserRepo: DiscordUserRepository;
    private GameStatsRepo: GameStatsRepository;
    private OpScoreRepository: OpScoreRepository;
    
    constructor() {
        this.connection = getConnection();
        this.UserRepo = getCustomRepository(DiscordUserRepository);
        this.GameStatsRepo = getCustomRepository(GameStatsRepository);
        this.OpScoreRepository = getCustomRepository(OpScoreRepository);
    }

    async pointRequest (message: Discord.Message) {
        const mention = message.mentions.members?.first();
        if (mention) {
            const user = await this.UserRepo.findOne({ id: mention.user.id });
            if (!user) await message.reply(`Benutzer nicht gefunden.`);
            else await message.reply(`${user?.name} hat momentan ${user?.points} Punkte.`);
        } else {
            const user = await this.UserRepo.findOne({ id: message.author.id });
            if (!user) await message.reply(`Benutzer nicht gefunden.`);
            else await message.reply(`${user?.name} hat momentan ${user?.points} Punkte.`);
        }
    }

    async muteRequest (message: Discord.Message) {
        let user = await this.UserRepo.findOne({ id: message.author.id });
        if (!user) {
            return await message.reply(`Benutzer nicht registriert`);
        }
        if (message.mentions.members?.size != 1) return await message.reply('Only 1 member per mute (@).');
        const target = message.mentions.members.first()!;

        const tokens = message.content.split('>');
        if (tokens.length != 2) return await message.reply('Falsches Format. !zehner mute @der echte nini 10.');
        const stringDuration = tokens[1].trim();
        const duration = Number(stringDuration);
        let cost = duration * 10;

        // Eiszapfen
        if (target.user.id === '259390262160261120') cost = cost / 2;
        
        if (Number.isNaN(duration)) return await message.reply('Zeitangabe ung??ltig.');

        const userPoints = Number(user.points);
        if (userPoints < cost) {
            return await message.reply(`Nicht gen??geng Punkte ${userPoints}/${cost}`);
        } else {
            console.log(`Muting ${target.user.username}`);
            await message.reply(`${target.user.username} wird f??r ${duration} Minute${duration > 1 ? 'n' : ''} gemuted.`);
            await target.voice.setMute(true);
            setTimeout(async () => {
                await target.voice.setMute(false);
                await message.reply(`${target.displayName} wurde wieder entmuted.`);
            }, 1000 * 60 * duration);
            user = await this.UserRepo.deductPoints(user.id, cost);
            await message.reply(`${cost} Punkte abgezogen. Es sind noch ${user?.points} ??brig.`);
        }
    }
}