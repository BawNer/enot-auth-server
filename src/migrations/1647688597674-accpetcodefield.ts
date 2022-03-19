import {MigrationInterface, QueryRunner} from "typeorm";

export class accpetcodefield1647688597674 implements MigrationInterface {
    name = 'accpetcodefield1647688597674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "acceptCode" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "acceptCode"`);
    }

}
