import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import { GameStats } from "../../models/GameStats";
import { OpScore } from '../../models/OpScore';
import { ZehnerVote } from "../../models/ZehnerVote";
import { DiscordUserRepository } from "./DiscordUserRepository";

@EntityRepository(GameStats)
export class GameStatsRepository extends Repository<GameStats> {
    async gameRecorded(gameId: string) {
        const game =  this.findOne({ id: gameId });
        if (game) return true;
        return false;
    }

    addGame(game: GameStats) {
        console.log(`Adding game: ${game.id}.`);
        return this.manager.save(game);
    }

    async addScoreToGame(gameId: string, score: OpScore) {
        const game = await this.findOne({ id: gameId }, { relations: ['scores'] });
        if (game) {
            game.scores.push(score);
            return this.manager.save(game);
        }
    }

    async addVoteToGame(gameId: string, discordUserId: string, voteFor: string, pointsAwarded: number, voteCorrect: boolean) {
        console.log(`Adding vote to game ${gameId} for user ${discordUserId} voting for ${voteFor}`);
        const userRepo = getCustomRepository(DiscordUserRepository);
        const game = await this.findOne({ id: gameId}, { relations: ['votes', 'votes.voteBy'] });
        const user = await userRepo.findOne({ id: discordUserId});
        if (game && user) {
            const vote = new ZehnerVote(game, user, new Date(), voteFor, pointsAwarded, voteCorrect);
            // check if user already voted for that game
            const index = game.votes.findIndex(v => v.voteBy.id === vote.voteBy.id);
            if (index == -1) {
                game.votes.push(vote);
                this.manager.save(game);
            } else {
                console.log(`Tried adding vote to game twice gameId: ${gameId} voteBy: ${vote.voteBy.name}`);
            }
        }
    }
}