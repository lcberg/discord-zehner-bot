import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { GameStats } from './GameStats';
import { ZehnerVote } from './ZehnerVote';

@Entity()
export class DiscordUser {
    @PrimaryColumn()
    id!: string;

    @Column()
    name!: string;   

    //TODO: implement logic
    @OneToMany(() => GameStats, gamestats => gamestats.requestedBy)
    gamesRequested!: Array<GameStats>;

    @Column('bigint')
    points!: number;

    @OneToMany(() => ZehnerVote, vote => vote.voteBy)
    votesCasted!: ZehnerVote;

    @Column("timestamp with time zone")
    createdAt!: Date;

    constructor() {
        
    }
}