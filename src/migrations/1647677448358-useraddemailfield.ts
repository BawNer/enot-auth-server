import {MigrationInterface, QueryRunner} from "typeorm";

export class useraddemailfield1647677448358 implements MigrationInterface {
    name = 'useraddemailfield1647677448358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    }

}
