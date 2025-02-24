import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTermsAndConditionPrivacyPolicyRefundPolicyFaq1740399357166
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT IGNORE INTO settings (setting_key, setting_value) VALUES 
        ('terms-condition', '/terms-condition'),
        ('privacy-policy', '/privacy-policy'),
        ('refund-policy', '/refund-policy'),
        ('faq', '/faq')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM settings WHERE setting_key IN ('terms-condition', 'privacy-policy', 'refund-policy' ,'faq')
      `);
  }
}
