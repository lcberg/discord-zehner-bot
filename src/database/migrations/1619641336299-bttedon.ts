import {MigrationInterface, QueryRunner} from "typeorm";

export class bttedon1619641336299 implements MigrationInterface {
    name = 'bttedon1619641336299'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "op_score" ("id" SERIAL NOT NULL, "name" text NOT NULL, "score" integer NOT NULL, "place" integer NOT NULL, "gameStatsId" text, CONSTRAINT "PK_f2c4cb081930dbc40f5ce4232f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD "bettedOn" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" DROP CONSTRAINT "FK_ac4368b7ff3708b0eb918dcaccc"`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" ADD "gameId" text`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP CONSTRAINT "PK_289bd8cd7cadaeb5f3f75746196"`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD "id" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD CONSTRAINT "PK_289bd8cd7cadaeb5f3f75746196" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP COLUMN "recordedAt"`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD "recordedAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "op_score" ADD CONSTRAINT "FK_b07b8baa594a02c2624563851ca" FOREIGN KEY ("gameStatsId") REFERENCES "game_stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" ADD CONSTRAINT "FK_ac4368b7ff3708b0eb918dcaccc" FOREIGN KEY ("gameId") REFERENCES "game_stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "zehner_vote" DROP CONSTRAINT "FK_ac4368b7ff3708b0eb918dcaccc"`);
        await queryRunner.query(`ALTER TABLE "op_score" DROP CONSTRAINT "FK_b07b8baa594a02c2624563851ca"`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP COLUMN "recordedAt"`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD "recordedAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP CONSTRAINT "PK_289bd8cd7cadaeb5f3f75746196"`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_stats" ADD CONSTRAINT "PK_289bd8cd7cadaeb5f3f75746196" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" DROP COLUMN "gameId"`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" ADD "gameId" character varying`);
        await queryRunner.query(`ALTER TABLE "zehner_vote" ADD CONSTRAINT "FK_ac4368b7ff3708b0eb918dcaccc" FOREIGN KEY ("gameId") REFERENCES "game_stats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_stats" DROP COLUMN "bettedOn"`);
        await queryRunner.query(`DROP TABLE "op_score"`);
    }

}
