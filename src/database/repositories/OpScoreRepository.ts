import { EntityRepository, getCustomRepository, Repository } from "typeorm";
import { OpScore } from "../../models/OpScore";
import { GameStatsRepository } from "./GameStatsRepository";

@EntityRepository(OpScore)
export class OpScoreRepository extends Repository<OpScore> {
    async createAndSave(gameId: string, name: string, score: number, place: number, champion: string, damage: number) {
        const gameRepo = getCustomRepository(GameStatsRepository);
        const game = await gameRepo.findOne({ id: gameId });

        if (game) {
            const opScore = new OpScore(game, name, score, place, champion, damage);
            return this.manager.save(opScore);
        }
    }
}