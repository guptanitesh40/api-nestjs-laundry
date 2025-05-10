import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDescriptionColumnOptinal1746855618150
  implements MigrationInterface
{
  name = 'UpdateDescriptionColumnOptinal1746855618150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`services\` CHANGE \`description\` \`description\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`services\` CHANGE \`description\` \`description\` varchar(255) NOT NULL`,
    );
  }
}
