import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAndAddColumnNameOrderTable1724403628911
  implements MigrationInterface
{
  name = 'ChangeAndAddColumnNameOrderTable1724403628911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_7fdb8279503d87a8b6a1880e3d4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`order_id\` \`order_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`order_id\` \`order_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`order_id\` \`orderOrderId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_7fdb8279503d87a8b6a1880e3d4\` FOREIGN KEY (\`orderOrderId\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
