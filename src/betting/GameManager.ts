import Discord from 'discord.js';
import { getConnection, getCustomRepository } from 'typeorm';
import { DiscordUserRepository } from '../database/repositories/DiscordUserRepository';
import { GameStatsRepository } from '../database/repositories/GameStatsRepository';
import { OpScoreRepository } from '../database/repositories/OpScoreRepository';
import { GameStats } from '../models/GameStats';
import { OpScore } from '../models/OpScore';
import OPService, { OpWebsiteGameStats, OpWebsiteScore } from '../OPService';

let betsRunning = false;

const opService = new OPService();

async function gameListner (message: Discord.Message, client: Discord.Client) {
    if (betsRunning) {
        message.reply('Betting game is already running. Wait for it to end before you start a new one.');
        return;
    }
    //betsRunning = true;

    if (message.channel.id === process.env.CHANNEL_ID && message.content.startsWith('!zehner bet')) {
        const name = message.content.replace('!zehner bet', '').trim();
        
        const connection = getConnection();
        const userRepo = connection.getCustomRepository(DiscordUserRepository);
        const gameStatsRepo = connection.getCustomRepository(GameStatsRepository);
        const opScoreRepo = getCustomRepository(OpScoreRepository);

        if (! await userRepo.userExists(message.author.id)) {
            console.log(`User with id ${message.author.id} is not yet in the database... creating it now.`);
            await userRepo.createAndSave(message.author.id, message.author.username);
        } else console.log(`User with id ${message.author.id} - ${message.author.username} is already in the database.`);

        let gameStats: OpWebsiteGameStats | null = null;
        if (name === 'test') {
            gameStats = createTestGame() as OpWebsiteGameStats;
            const dbGameScores = gameStats.OpScores.map(s => {
                return new OpScore(undefined, s.name, s.score, s.place, s.champion, s.damage);
            })
            const dbGameStats = new GameStats(gameStats.gameId, new Date(), )
            dbGameScores.forEach(s => s.gameStats = dbGameStats);
            await gameStatsRepo.addGame(dbGameStats);
            for (const opScore of gameStats.OpScores) {
                await opScoreRepo.createAndSave(gameStats.gameId, opScore.name, opScore.score, opScore.place, opScore.champion, opScore.damage);
            }

        } else {
            gameStats = await opService.getUserScores(name);
            // save game stats to database
            // convert to database gamestats first
            const dbGameScores = gameStats.OpScores.map(s => {
                return new OpScore(undefined, s.name, s.score, s.place, s.champion, s.damage);
            })
            const dbGameStats = new GameStats(gameStats.gameId, new Date(), )
            dbGameScores.forEach(s => s.gameStats = dbGameStats);
            await gameStatsRepo.addGame(dbGameStats);
            for (const opScore of gameStats.OpScores) {
                await opScoreRepo.createAndSave(gameStats.gameId, opScore.name, opScore.score, opScore.place, opScore.champion, opScore.damage);
            }
        }

        if(!gameStats.gameId || !(gameStats.OpScores.length === 10)) {
            message.reply(`Sorry - couldn't calculate game stats for last game of ${name}.`);
            return;
        }

        const channel = client.channels.cache.get(process.env.CHANNEL_ID);
        if (channel?.isText()) {
            const bettingMessage = await channel.send(`Starting a zehner betting game
                1) ${gameStats.OpScores[0].name}
                2) ${gameStats.OpScores[1].name}
                3) ${gameStats.OpScores[2].name}
                4) ${gameStats.OpScores[3].name}
                5) ${gameStats.OpScores[4].name}
                6) ${gameStats.OpScores[5].name}
                7) ${gameStats.OpScores[6].name}
                8) ${gameStats.OpScores[7].name}
                9) ${gameStats.OpScores[8].name}
                10) ${gameStats.OpScores[9].name}
            React with ONE emoji to cast your vote! (Choosing multiple will not register your vote.)
            `);

            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
            const emojiOpScoreMap = new Map<string, OpWebsiteScore>();

            let i = 0;
            let winnerEmoji = '';
            for (const score of gameStats.OpScores) {
                emojiOpScoreMap.set(emojis[i], score);
                if (score.place === 10) winnerEmoji = emojis[i];
                i++;
            }

            for (const emoji of emojis) {
                bettingMessage.react(emoji);
            }

            let timeLeft = 10;

            const timerMessage = await channel.send(`Time left: ${timeLeft} seconds.`);

            const countdownInterval = setInterval(async () => {
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    await timerMessage.edit('The betting has concluded');

                    const reactions = bettingMessage.reactions.cache;
                    // ban some users because of multi voting
                    const bannedUserIds: Array<string> = []
                    const registeredVoters: Array<string> = [];
                    for (const emoji of emojis) {
                        const voters = reactions.get(emoji)?.users.cache.map(u => u.id);
                        for (const voter of voters!) {
                            if (registeredVoters.includes(voter)) bannedUserIds.push(voter);
                            registeredVoters.push(voter);
                        }
                    }

                    // save votes to database
                    for (const emoji of emojis) {
                        // if (name === 'test') break;
                        const voters = reactions.get(emoji)?.users.cache.filter(u => u.username !== 'zehner' && u.username !== 'zehner-dev');
                        if (!voters) break;

                        const voteFor = emojiOpScoreMap.get(emoji)?.name;

                        const voteCorrect = emojiOpScoreMap.get(emoji)!.place === 10;
                        const pointsAwarded = voteCorrect ? voters.size === 1 ? 10 : 5 : 0;

                        for (const voter of voters) {
                            // skip if banned
                            if (bannedUserIds.includes(voter[1].id)) continue;
                            gameStatsRepo.addVoteToGame(gameStats!.gameId, voter[1].id, voteFor!, pointsAwarded, voteCorrect);
                        }
                    }

                    const winnerReaction = reactions.get(winnerEmoji);
                    const winners = winnerReaction?.users;

                    // ban users
                    const prunedWinners = winners!.cache.filter(u => u.username !== 'zehner' && u.username !== 'zehner-dev' && !bannedUserIds.includes(u.id));

                    //channel.send(`Winners: ${winners?.cache.values.}`)
                    if (prunedWinners.size > 0) await channel.send(`Winners: ${prunedWinners.map(u => u.username).join(', ')} (${prunedWinners.size === 1 ? '10' : '5'} points).`);
                    else await channel.send('jeder ist fukking dief!');

                    channel.send(`Den zehner hat natürlich ${gameStats?.OpScores.find(s => s.place === 10)?.name}.`);

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

function createTestGame(): OpWebsiteGameStats {
    const opScores: Array<OpWebsiteScore> = [
        {
            name: 'der echte nini',
            place: 10,
            placeText: '10th',
            score: 2,
            champion: 'Diana',
            damage: 1
        },
        {
            name: 'Zurücklehner',
            place: 9,
            placeText: '9th',
            score: 3.1,
            champion: 'Nunu',
            damage: 1200
        },
        {
            name: 'LG Der Bamboost',
            place: 8,
            placeText: '8th',
            score: 3.5,
            champion: 'Jinx',
            damage: 567
        },
        {
            name: 'Mobitax00',
            place: 7,
            placeText: '7th',
            score: 4.2,
            champion: 'Swain',
            damage: 0
        },
        {
            name: 'Scheißzapfenplays',
            place: 6,
            placeText: '6th',
            score: 5,
            champion: 'Braum',
            damage: 987
        }, 
        {
            name: 'n4rr',
            place: 5,
            placeText: 'ACE',
            score: 6.9,
            champion: 'Sion',
            damage: 78612
        },
        {
            name: 'KDA Robin',
            place: 4,
            placeText: '4th',
            score: 7.2,
            champion: 'Lee Sin',
            damage: 1337
        },
        {
            name: 'Raggitroll',
            place: 3,
            placeText: '3rd',
            score: 7.8,
            champion: 'Orrn',
            damage: 476
        },
        {
            name: 'dumbledocus (booster)',
            place: 2,
            placeText: '2nd',
            score: 8.1,
            champion: 'Ezreal',
            damage: 9999999
        },
        {
            name: 'LLouis',
            place: 1,
            placeText: 'MVP',
            score: 10,
            champion: 'Le Blanc',
            damage: 17263
        }
    ]

    return new OpWebsiteGameStats(opScores, '12345678');
}

export default gameListner;