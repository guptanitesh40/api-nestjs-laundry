import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderAndOrderItemTable1724323424584
  implements MigrationInterface
{
  name = 'CreateOrderAndOrderItemTable1724323424584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`order_id\` int NOT NULL AUTO_INCREMENT, \`description\` text NULL, \`coupon_code\` varchar(255) NULL, \`express_delivery_charges\` int NULL, \`sub_total\` decimal NOT NULL, \`shipping_charge\` decimal NOT NULL, \`total\` decimal NOT NULL, \`address_id\` int NOT NULL, \`address_details\` varchar(255) NOT NULL, PRIMARY KEY (\`order_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`order_items\` (\`item_id\` int NOT NULL AUTO_INCREMENT, \`category_id\` int NOT NULL, \`product_id\` int NOT NULL, \`service_id\` int NOT NULL, \`price\` decimal NOT NULL, \`order_id\` int NULL, PRIMARY KEY (\`item_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_d39c53244703b8534307adcd073\` FOREIGN KEY (\`address_id\`) REFERENCES \`user_addresses\`(\`address_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_7fdb8279503d87a8b6a1880e3d4\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_4094d4ef12f2b0d8f24e65a9ca7\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_4b7bcdfcab38cf99bc8ded5c48a\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`service_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_4b7bcdfcab38cf99bc8ded5c48a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_4094d4ef12f2b0d8f24e65a9ca7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_7fdb8279503d87a8b6a1880e3d4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_d39c53244703b8534307adcd073\``,
    );
    await queryRunner.query(`DROP TABLE \`order_items\``);
    await queryRunner.query(`DROP TABLE \`orders\``);
  }
}
