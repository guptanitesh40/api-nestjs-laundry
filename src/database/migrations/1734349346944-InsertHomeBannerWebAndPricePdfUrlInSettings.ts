import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertHomeBannerWebAndPricePdfUrlInSettings1734349346944
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO settings (setting_key, setting_value) 
             VALUES ('home_promotion_banner_website', 
             '{"title": "5 Saree Roll Press",
              "price": "200",
               "offer_validity": "20 Mar 2024",
                "image_url": "http://35.154.167.170:3000/logo/logo2.jpg"}')`,
    );

    await queryRunner.query(
      `INSERT INTO settings (setting_key, setting_value) 
             VALUES ('price_pdf_url', 'http://35.154.167.170:3000/pdf/priceList.pdf')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM settings WHERE setting_key IN ('home_promotion_banner_website', 'price_pdf_url')`,
    );
  }
}
