import {MigrationInterface, QueryRunner} from "typeorm";

export class championDamage1620556487989 implements MigrationInterface {
    name = 'championDamage1620556487989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "op_score" ADD "champion" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "op_score" ADD "damage" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "op_score" DROP COLUMN "damage"`);
        await queryRunner.query(`ALTER TABLE "op_score" DROP COLUMN "champion"`);
    }

}
