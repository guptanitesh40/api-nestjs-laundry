import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserIdToOrderNotesTable1735736953308
  implements MigrationInterface
{
  name = 'RemoveUserIdToOrderNotesTable1735736953308';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` DROP FOREIGN KEY \`FK_7708dcb62ff332f0eaf9f0743a7\``,
    );
    await queryRunner.query(`ALTER TABLE \`notes\` DROP COLUMN \`user_id\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notes\` ADD \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notes\` ADD CONSTRAINT \`FK_7708dcb62ff332f0eaf9f0743a7\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
