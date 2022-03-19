import {MigrationInterface, QueryRunner} from "typeorm";

export class UserEntity1647630844067 implements MigrationInterface {
    name = 'UserEntity1647630844067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "login" character varying NOT NULL, "password" character varying NOT NULL, "refreshToken" character varying NOT NULL, "bio" character varying, "photo" character varying, "isEmailVerificate" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "yandexId" text, "vkId" text, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
