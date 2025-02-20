import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRolesFlag1740047318728 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE roles SET flag = TRUE WHERE role_id IN (2, 3, 6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE roles SET flag = FALSE WHERE role_id IN (2, 3, 6)`,
    );
  }
}
