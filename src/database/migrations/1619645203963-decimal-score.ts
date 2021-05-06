import {MigrationInterface, QueryRunner} from "typeorm";

export class decimalScore1619645203963 implements MigrationInterface {
    name = 'decimalScore1619645203963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "op_score" DROP COLUMN "score"`);
        await queryRunner.query(`ALTER TABLE "op_score" ADD "score" numeric NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "op_score" DROP COLUMN "score"`);
        await queryRunner.query(`ALTER TABLE "op_score" ADD "score" integer NOT NULL`);
    }

}
