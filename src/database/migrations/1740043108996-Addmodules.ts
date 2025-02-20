import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addmodules1740043108996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO modules (module_id, module_name) VALUES 
        (1, 'dashboard'),
        (2, 'settings'),
        (3, 'orders'),
        (4, 'payments'),
        (5, 'category'),
        (6, 'products'),
        (7, 'services'),
        (8, 'customers'),
        (9, 'coupon'),
        (10, 'prices'),
        (11, 'price_content'),
        (12, 'company'),
        (13, 'branch'),
        (14, 'banner'),
        (15, 'workshop'),
        (16, 'workshop_orders'),
        (17, 'customer_feedbacks');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM modules WHERE module_name IN (
          'dashboard',
          'settings',
          'orders',
          'payments',
          'category',
          'products',
          'services',
          'customers',
          'coupon',
          'prices',
          'price_content',
          'company',
          'branch',
          'banner',
          'workshop',
          'workshop_orders',
          'customer_feedbacks'
        );
      `);
  }
}
