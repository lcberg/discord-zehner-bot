import {MigrationInterface, QueryRunner} from "typeorm";

export class entities1619478930538 implements MigrationInterface {
    name = 'entities1619478930538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_user" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "discord_user" DROP COLUMN "createdAt"`);
    }

}
