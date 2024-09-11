import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryBoyOrders1725959054478 implements MigrationInterface {
  name = 'AddDeliveryBoyOrders1725959054478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`delivery_boy_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_2ce2f7840fb7b6b18ae72a9c067\` FOREIGN KEY (\`delivery_boy_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_2ce2f7840fb7b6b18ae72a9c067\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP COLUMN \`delivery_boy_id\``,
    );
  }
}
