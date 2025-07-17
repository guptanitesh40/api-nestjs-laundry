import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColumnConfirmByAndDeliveredByInOrderTable1752745736872
  implements MigrationInterface
{
  name = 'RemoveColumnConfirmByAndDeliveredByInOrderTable1752745736872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_be5767d2b007e932bed714496a9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_e6422ee39293438e8066a304440\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`confirm_by_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`delivered_by_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`delivered_by_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`confirm_by_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_e6422ee39293438e8066a304440\` FOREIGN KEY (\`delivered_by_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_be5767d2b007e932bed714496a9\` FOREIGN KEY (\`confirm_by_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
