import { timingSafeEqual } from "crypto";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameStats } from "./GameStats";

@Entity()
@Index(['id', 'name'], { unique: true })
export class OpScore {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @ManyToOne(() => GameStats, gamestats => gamestats.scores)
    gameStats!: GameStats;

    @Column("text")
    name!: string

    @Column("decimal")
    score!: number;

    @Column("text")
    champion!: string;

    @Column("decimal")
    damage!: number;

    @Column("int")
    place!: number;

    constructor(gameStats?: GameStats, name?: string, score?: number, place?: number, champion?: string, damage?: number) {
        if (gameStats) this.gameStats = gameStats;
        if (name) this.name = name;
        if (score) this.score =  score;
        if (place) this.place = place;
        if (champion) this.champion = champion;
        if (damage) this.damage = damage;
    }
}