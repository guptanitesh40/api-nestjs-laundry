import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProductCategoryServiceAddressPricesRolesTables1723547354135
  implements MigrationInterface
{
  name =
    'CreateUserProductCategoryServiceAddressPricesRolesTables1723547354135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`product_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`image\` varchar(255) NOT NULL, PRIMARY KEY (\`product_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_addresses\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`address_id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NULL, \`phone_number\` varchar(255) NULL, \`building_number\` varchar(255) NULL, \`area\` varchar(255) NULL, \`landmark\` varchar(255) NULL, \`lat\` decimal NULL, \`long\` decimal NULL, \`pincode\` int NULL, \`city\` varchar(255) NULL, \`state\` varchar(255) NULL, \`country\` varchar(255) NULL, \`user_id\` int NULL, \`userUserId\` int NULL, PRIMARY KEY (\`address_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NULL, \`last_name\` varchar(255) NULL, \`email\` varchar(255) NULL, \`mobile_number\` decimal NULL, \`password\` varchar(255) NOT NULL, \`gender\` int NULL, \`role_id\` int NOT NULL, PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`roles\` (\`role_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`role_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`categories\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`category_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`category_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`services\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`service_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`image\` varchar(255) NOT NULL, PRIMARY KEY (\`service_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`prices\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`price_id\` int NOT NULL AUTO_INCREMENT, \`category_id\` int NOT NULL, \`product_id\` int NOT NULL, \`service_id\` int NOT NULL, \`price\` int NULL, PRIMARY KEY (\`price_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` ADD CONSTRAINT \`FK_da58308b7b6b340f19dc94210c3\` FOREIGN KEY (\`userUserId\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`role_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`prices\` ADD CONSTRAINT \`FK_0817500adade8e4ed070da423b5\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`prices\` ADD CONSTRAINT \`FK_144765f6b6bef86e113b507ed12\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`prices\` ADD CONSTRAINT \`FK_1f858d2631e4168d38440de398f\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`service_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`prices\` DROP FOREIGN KEY \`FK_1f858d2631e4168d38440de398f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`prices\` DROP FOREIGN KEY \`FK_144765f6b6bef86e113b507ed12\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`prices\` DROP FOREIGN KEY \`FK_0817500adade8e4ed070da423b5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` DROP FOREIGN KEY \`FK_da58308b7b6b340f19dc94210c3\``,
    );
    await queryRunner.query(`DROP TABLE \`prices\``);
    await queryRunner.query(`DROP TABLE \`services\``);
    await queryRunner.query(`DROP TABLE \`categories\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``,
    );
    await queryRunner.query(`DROP TABLE \`roles\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`user_addresses\``);
    await queryRunner.query(`DROP TABLE \`products\``);
  }
}
