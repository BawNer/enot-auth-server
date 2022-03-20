import {MigrationInterface, QueryRunner} from "typeorm";

export class extmail1647759847007 implements MigrationInterface {
    name = 'extmail1647759847007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT`);
    }

}
