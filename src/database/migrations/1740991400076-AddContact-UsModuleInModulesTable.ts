import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactUsModuleInModulesTable1740991400076
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO modules (module_id, module_name) VALUES (18, 'contact-us')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM modules WHERE module_name = 'contact-us'`,
    );
  }
}
