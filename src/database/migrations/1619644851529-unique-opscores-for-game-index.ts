import {MigrationInterface, QueryRunner} from "typeorm";

export class uniqueOpscoresForGameIndex1619644851529 implements MigrationInterface {
    name = 'uniqueOpscoresForGameIndex1619644851529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_af4c9065805f52a2a2463a6e77" ON "op_score" ("id", "name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_af4c9065805f52a2a2463a6e77"`);
    }

}
