import { Entity, Column, ManyToMany, PrimaryColumn, OneToMany } from 'typeorm';
import { OpScore } from './OpScore';
import { DiscordUser } from './DiscordUser';
import { ZehnerVote } from './ZehnerVote';

@Entity()
export class GameStats {
    @PrimaryColumn("text")
    id!: string;

    @Column("timestamp with time zone")
    recordedAt!: Date;

    @ManyToMany(() => DiscordUser, user => user.gamesRequested)
    requestedBy!: DiscordUser;

    @OneToMany(() => ZehnerVote, vote => vote.game, { cascade: true })
    votes!: Array<ZehnerVote>;

    @OneToMany(() => OpScore, score => score.gameStats)
    scores!: Array<OpScore>;

    @Column({
        default: false,
        type: "boolean"
    })
    bettedOn!: boolean;

    constructor(id?: string, recordedAt?: Date, scores?: Array<OpScore>) {
        if (id) this.id = id;
        if (recordedAt) this.recordedAt = recordedAt;
        if (scores) this.scores = scores;
    }
}