import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveredByIdInOrderTable1752647806029
  implements MigrationInterface
{
  name = 'AddDeliveredByIdInOrderTable1752647806029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`delivered_by_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_e6422ee39293438e8066a304440\` FOREIGN KEY (\`delivered_by_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_e6422ee39293438e8066a304440\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`delivered_by_id\``,
    );
  }
}
