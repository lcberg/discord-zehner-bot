import { OpWebsiteGameStats, OpWebsiteScore } from "../../OPService";
import Discord from 'discord.js';

export function sendBettingMessage(channel: Discord.TextChannel, gameStats: OpWebsiteGameStats) {
    return channel.send(`Starting a zehner betting game
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
}

export async function addBettingReactions(message: Discord.Message, emojis: Array<string>) {
    if (emojis.length !== 10) throw new Error('Not enough emojis provided!');

    for (const emoji of emojis) {
        message.react(emoji);
    }
}

export function addGameScoresToBettingMessage(message: Discord.Message, gameStats: OpWebsiteGameStats) {
    let result = 'Results\n';
    for (let i = 0; i <= 9; i++) {
        result += rowPrefix(gameStats.OpScores[i], i) + `${gameStats!.OpScores[i].name} - ${gameStats!.OpScores[i].champion} - ${gameStats!.OpScores[i].place} (${gameStats!.OpScores[i].score})\n`;
    }

    return message.edit(result);
}

function rowPrefix(opScore: OpWebsiteScore, index: number): string {
    if (opScore.place === 10) return '👨‍🦽) ';
    else if (opScore.place === 1) return '🥇) ';
    else if (opScore.place === 2) return '🥈) ';
    else if (opScore.place === 3) return '🥉) ';
    else return `${index + 1}) `;
}