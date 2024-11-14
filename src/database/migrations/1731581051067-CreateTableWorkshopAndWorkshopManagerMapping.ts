import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableWorkshopAndWorkshopManagerMapping1731581051067
  implements MigrationInterface
{
  name = 'CreateTableWorkshopAndWorkshopManagerMapping1731581051067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`workshop_manager_mapping\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`workshop_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`workshop\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`workshop_id\` int NOT NULL AUTO_INCREMENT, \`workshop_name\` varchar(255) NULL, \`email\` varchar(255) NULL, \`address\` varchar(255) NULL, \`mobile_number\` decimal NULL, PRIMARY KEY (\`workshop_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`workshop_manager_mapping\` ADD CONSTRAINT \`FK_d7efef238ff8433d7d160053d15\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`workshop_manager_mapping\` ADD CONSTRAINT \`FK_b1ea26ffe9d80d2e72c1ef41028\` FOREIGN KEY (\`workshop_id\`) REFERENCES \`workshop\`(\`workshop_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`workshop_manager_mapping\` DROP FOREIGN KEY \`FK_b1ea26ffe9d80d2e72c1ef41028\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`workshop_manager_mapping\` DROP FOREIGN KEY \`FK_d7efef238ff8433d7d160053d15\``,
    );
    await queryRunner.query(`DROP TABLE \`workshop\``);
    await queryRunner.query(`DROP TABLE \`workshop_manager_mapping\``);
  }
}
