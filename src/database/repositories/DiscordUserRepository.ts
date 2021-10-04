import { EntityRepository, Repository } from "typeorm";
import { DiscordUser } from "../../models/DiscordUser";

@EntityRepository(DiscordUser)
export class DiscordUserRepository extends Repository<DiscordUser> {
    async userExists(discordUserId: string) {
        const user = await this.findOne({ id: discordUserId });
        if (user) return true;
        return false;
    }

    createAndSave(discordUserId: string, discordUserName: string) {
        const user = new DiscordUser();
        user.createdAt = new Date();
        user.id = discordUserId;
        user.name = discordUserName;
        user.points = 0;
        return this.manager.save(user);
    }

    async awardPoints(discordUserId: string, points: number) {
        const user = await this.findOne(discordUserId);
        if (user) {
            // have to overwrite since user.points is a string
            const userPoints = Number(user.points);
            user.points = userPoints + points;
            return this.manager.save(user);
        }
    }

    async deductPoints (discordUserId: string, points: number) {
        const user = await this.findOne(discordUserId);
        if (user) {
            const userPoints = Number(user.points);
            user.points = userPoints - points;
            return this.manager.save(user);
        }
    }
}