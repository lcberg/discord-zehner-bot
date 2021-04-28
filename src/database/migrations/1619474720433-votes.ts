import {MigrationInterface, QueryRunner} from "typeorm";

export class votes1619474720433 implements MigrationInterface {
    name = 'votes1619474720433'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "zehner_vote" ("id" SERIAL NOT NULL, "votedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "voteFor" text NOT NULL, "pointsAwarded" integer NOT NULL, "voteCorrect" boolean NOT NULL, "gameId" character varying, "voteById" character varying, CONSTRAINT "PK_478853aca19454028fa698a3183" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_stats" ("id" character varying NOT NULL, "recordedAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_289bd8cd7cadaeb5f3f75746196" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discord_user" ("id" character varying NOT NULL, "name" character varying NOT NULL, "points" bigint NOT NULL, CONSTRAINT "PK_2c465db058d41ca3a50f819b0a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" ADD CONSTRAINT "FK_ac4368b7ff3708b0eb918dcaccc" FOREIGN KEY ("gameId") REFERENCES "game_stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" ADD CONSTRAINT "FK_87f11906404ca4a07830805c6ac" FOREIGN KEY ("voteById") REFERENCES "discord_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zehner_vote" DROP CONSTRAINT "FK_87f11906404ca4a07830805c6ac"`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" DROP CONSTRAINT "FK_ac4368b7ff3708b0eb918dcaccc"`);
        await queryRunner.query(`DROP TABLE "discord_user"`);
        await queryRunner.query(`DROP TABLE "game_stats"`);
        await queryRunner.query(`DROP TABLE "zehner_vote"`);
    }

}
