import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoteColumnInLaundryServiceTable1752125528078
  implements MigrationInterface
{
  name = 'AddNoteColumnInLaundryServiceTable1752125528078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`laundry-services\` ADD \`note\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`laundry-services\` DROP COLUMN \`note\``,
    );
  }
}
