import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerLogsModuleInModulesTable1744700544264
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO modules (module_id, module_name) VALUES (19, 'customer-logs')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM modules WHERE module_name = 'customer-logs'`,
    );
  }
}
