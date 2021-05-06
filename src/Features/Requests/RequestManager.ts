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

    async pointRequest(message: Discord.Message) {
        const name = message.content.replace('!zehner points', '').trim();

        let user: DiscordUser | undefined;
        if (!(name.length > 0)) {
            user = await this.UserRepo.findOne({ id: message.author.id });
        } else {
            user = await this.UserRepo.findOne({ name: name });
        }

        if (!user) message.reply('Benutzer nicht gefunden.');
        else message.reply(`${user.name} hat momentan ${user.points} Punkte`);
    }
}