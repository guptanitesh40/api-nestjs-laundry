import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolePermissionTable1740045471154
  implements MigrationInterface
{
  name = 'CreateRolePermissionTable1740045471154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role_permission\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`role_permission_id\` int NOT NULL AUTO_INCREMENT, \`role_id\` int NULL, \`module_id\` int NULL, \`create\` varchar(255) NULL, \`update\` varchar(255) NULL, \`read\` varchar(255) NULL, \`delete\` varchar(255) NULL, PRIMARY KEY (\`role_permission_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` ADD CONSTRAINT \`FK_3d0a7155eafd75ddba5a7013368\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`role_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` ADD CONSTRAINT \`FK_962437a6cace6f9dea98fdccde9\` FOREIGN KEY (\`module_id\`) REFERENCES \`modules\`(\`module_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_962437a6cace6f9dea98fdccde9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_3d0a7155eafd75ddba5a7013368\``,
    );
    await queryRunner.query(`DROP TABLE \`role_permission\``);
  }
}
