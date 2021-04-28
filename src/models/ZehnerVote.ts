import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DiscordUser } from "./DiscordUser";
import { GameStats } from './GameStats';

@Entity()
export class ZehnerVote {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @ManyToOne(() => GameStats, gamestats => gamestats.votes)
    game!: GameStats;

    @ManyToOne(() => DiscordUser, user => user.votesCasted)
    voteBy!: DiscordUser;

    @Column("timestamp with time zone")
    votedAt!: Date;

    @Column("text")
    voteFor!: string;

    @Column("int")
    pointsAwarded!: number;

    @Column("boolean")
    voteCorrect!: boolean;

    constructor(game?: GameStats, voteBy?: DiscordUser, votedAt?: Date, voteFor?: string, pointsAwarded?: number, voteCorrect?: boolean) {
        if (game !== undefined) this.game = game;
        if (voteBy !== undefined) this.voteBy = voteBy;
        if (votedAt !== undefined) this.votedAt = votedAt;
        if (voteFor !== undefined) this.voteFor = voteFor;
        if (pointsAwarded !== undefined) this.pointsAwarded = pointsAwarded;
        if (voteCorrect !== undefined) this.voteCorrect = voteCorrect;
    }
}