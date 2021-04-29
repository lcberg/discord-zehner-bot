import Discord, { MessageReaction } from 'discord.js';
import { create } from 'domain';
import { createConnection, getConnection, getCustomRepository } from 'typeorm';
import { DiscordUserRepository } from '../../database/repositories/DiscordUserRepository';
import { GameStatsRepository } from '../../database/repositories/GameStatsRepository';
import { OpScoreRepository } from '../../database/repositories/OpScoreRepository';
import { DiscordUser } from '../../models/DiscordUser';
import { GameStats } from '../../models/GameStats';
import { OpScore } from '../../models/OpScore';
import { ZehnerVote } from '../../models/ZehnerVote';
import OPService, { OpWebsiteGameStats, OpWebsiteScore } from '../../OPService';
import { addBettingReactions, addGameScoresToBettingMessage, sendBettingMessage } from './GameAnnouncer';
import { createTestGame } from './GameMock';


let betsRunning = false;

export default async function gameListner (message: Discord.Message, client: Discord.Client) {
    const connection = getConnection();
    const userRepo = connection.getCustomRepository(DiscordUserRepository);
    const gameStatsRepo = connection.getCustomRepository(GameStatsRepository);
    const opScoreRepo = getCustomRepository(OpScoreRepository);
    if (betsRunning) {
        message.reply('Betting game is already running. Wait for it to end before you start a new one.');
        return;
    }
    // give feedback that bot is runnning
    message.react('✅');
    //betsRunning = true;
    const channel = client.channels.cache.get(process.env.CHANNEL_ID!);

    if (message.channel.id === process.env.CHANNEL_ID && message.content.startsWith('!zehner bet')) {
        const name = message.content.replace('!zehner bet', '').trim();
        
        if (! await userRepo.userExists(message.author.id)) {
            console.log(`User with id ${message.author.id} is not yet in the database... creating it now.`);
            await userRepo.createAndSave(message.author.id, message.author.username);
        } else console.log(`User with id ${message.author.id} - ${message.author.username} is already in the database.`);

        let gameStats: OpWebsiteGameStats | null = null;

        const opService = new OPService();
        await opService.setup();
        try {
            gameStats = await opService.getUserScores(name);
        } catch (error) {
            message.reply('Anschiss :( try again...');
            console.log(error);
            return;
        }

        // save game stats to database
        await saveGameToDatabase(gameStats);
        

        if(!gameStats.gameId || !(gameStats.OpScores.length === 10)) {
            message.reply(`Sorry - beim berechnen der Stats vom letzten Game ist ein oopsie passiert!.`);
            return;
        }

        if (channel?.isText()) {
            const bettingMessage = await sendBettingMessage(channel as Discord.TextChannel, gameStats)

            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            const emojiOpScoreMap = new Map<string, OpWebsiteScore>();

            // setup winner determinig logic
            let i = 0;
            let winnerEmoji = '';
            for (const score of gameStats.OpScores) {
                emojiOpScoreMap.set(emojis[i], score);
                if (score.place === 10) winnerEmoji = emojis[i];
                i++;
            }

            await addBettingReactions(bettingMessage, emojis);

            let timeLeft = 20;

            const timerMessage = await channel.send(`Time left: ${timeLeft} seconds.`);

            const countdownInterval = setInterval(async () => {
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    await timerMessage.edit('The betting has concluded');

                    const reactions = bettingMessage.reactions.cache;
                    const bannedUserIds = (await calculateBannedUsers(reactions)).map(u => u.id);

                    await persistVotesToDatabase(emojis, emojiOpScoreMap, reactions, gameStats!, bannedUserIds);

                    const winnerReaction = reactions.get(winnerEmoji);
                    const winners = winnerReaction?.users;

                    // ban users
                    const prunedWinners = winners!.cache.filter(u => u.username !== 'zehner' && u.username !== 'zehner-dev' && !bannedUserIds.includes(u.id));

                    //channel.send(`Winners: ${winners?.cache.values.}`)
                    if (prunedWinners.size > 0) await channel.send(`Winners: ${prunedWinners.map(u => u.username).join(', ')} (${prunedWinners.size === 1 ? '10' : '5'} points).`);
                    else await channel.send('jeder ist fukking dief!');

                    await channel.send(`Den zehner hat natürlich ${gameStats?.OpScores.find(s => s.place === 10)?.name}.`);
                    await addGameScoresToBettingMessage(bettingMessage, gameStats!);


                    for (const winner of prunedWinners) {
                        await userRepo.awardPoints(winner[1].id , prunedWinners.size === 1 ? 10 : 5);
                    }

                    return;
                }
                    
                if (timeLeft % 5 === 0) timerMessage.edit(`Time left: ${timeLeft} seconds`);
                timeLeft--;
            }, 1000);

        }
    }
}

async function calculateBannedUsers(reactions: Discord.Collection<string, MessageReaction>) {
    const bannedUsers: Array<Discord.User> = [];
    const registeredVoterIds: Array<string> = [];
    
    for (const r of reactions) {
        for (const reactor of r[1].users.cache) {
            if (registeredVoterIds.includes(reactor[1].id)) bannedUsers.push(reactor[1]);
            registeredVoterIds.push(reactor[1].id);
        }
    }

    return bannedUsers;
}

async function persistVotesToDatabase(emojis: Array<string>, emojiScoreMap: Map<string, OpWebsiteScore>, reactions: Discord.Collection<string, MessageReaction>, gameStats: OpWebsiteGameStats, bannedUserIds: Array<string>) {
    const gameStatsRepo = getCustomRepository(GameStatsRepository);
    
    // save votes to database
    for (const emoji of emojis) {
        // if (name === 'test') break;
        const voters = reactions.get(emoji)?.users.cache.filter(u => u.username !== 'zehner' && u.username !== 'zehner-dev');
        if (!voters) break;

        const voteFor = emojiScoreMap.get(emoji)?.name;

        const voteCorrect = emojiScoreMap.get(emoji)!.place === 10;
        const pointsAwarded = voteCorrect ? voters.size === 1 ? 10 : 5 : 0;

        for (const voter of voters) {
            // skip if banned
            if (bannedUserIds.includes(voter[1].id)) continue;
            gameStatsRepo.addVoteToGame(gameStats!.gameId, voter[1].id, voteFor!, pointsAwarded, voteCorrect);
        }
    }
}

async function saveGameToDatabase(gameStats: OpWebsiteGameStats) {
    const gameStatsRepo = getCustomRepository(GameStatsRepository);
    const opScoreRepo = getCustomRepository(OpScoreRepository);

    const dbGameScores = gameStats.OpScores.map(s => {
        return new OpScore(undefined, s.name, s.score, s.place);
    })
    const dbGameStats = new GameStats(gameStats.gameId, new Date(), )
    dbGameScores.forEach(s => s.gameStats = dbGameStats);
    await gameStatsRepo.addGame(dbGameStats);
    for (const opScore of gameStats.OpScores) {
        await opScoreRepo.createAndSave(gameStats.gameId, opScore.name, opScore.score, opScore.place);
    }
}