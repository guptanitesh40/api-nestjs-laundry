import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLabelsTable1747657333021 implements MigrationInterface {
  name = 'CreateLabelsTable1747657333021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`labels\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`label_id\` int NOT NULL AUTO_INCREMENT, \`label_name\` varchar(255) NOT NULL, PRIMARY KEY (\`label_id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`labels\``);
  }
}
