import {MigrationInterface, QueryRunner} from "typeorm";

export class AddActivationLink1647631823068 implements MigrationInterface {
    name = 'AddActivationLink1647631823068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "activationLink" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "activationLink"`);
    }

}
