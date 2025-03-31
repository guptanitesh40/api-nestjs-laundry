import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnOrderTableExpressDeliveryHour1743419675545
  implements MigrationInterface
{
  name = 'AddColumnOrderTableExpressDeliveryHour1743419675545';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`express_delivery_hour\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`express_delivery_hour\``,
    );
  }
}
