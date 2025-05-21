import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportsAndLabelManagementModuleInModulesTable1747811307382
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO modules (module_id, module_name) VALUES 
        (20, 'reports'),
        (21, 'label_management');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM modules WHERE module_name IN (
          'reports',
          'label_management'
        );
      `);
  }
}
