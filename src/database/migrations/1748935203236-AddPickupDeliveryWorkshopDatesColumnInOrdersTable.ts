import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPickupDeliveryWorkshopDatesColumnInOrdersTable1748935203236
  implements MigrationInterface
{
  name = 'AddPickupDeliveryWorkshopDatesColumnInOrdersTable1748935203236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`pickup_date\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`workshop_date\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`ready_delivery_date\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`delivery_date\` timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`confirm_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`confirm_date\` timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`confirm_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`confirm_date\` date NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`delivery_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`ready_delivery_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`workshop_date\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`pickup_date\``,
    );
  }
}
