import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLaundryServicesTable1752061322090
  implements MigrationInterface
{
  name = 'CreateLaundryServicesTable1752061322090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`laundry-services\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`laundry_service_id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`image\` varchar(255) NOT NULL, PRIMARY KEY (\`laundry_service_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`laundry-services\``);
  }
}
