import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPickupBoyIdColumnInOrderTable1732183521070
  implements MigrationInterface
{
  name = 'AddPickupBoyIdColumnInOrderTable1732183521070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`pickup_boy_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_57bdf93a4e3c360f76570eef93a\` FOREIGN KEY (\`pickup_boy_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_57bdf93a4e3c360f76570eef93a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`pickup_boy_id\``,
    );
  }
}
