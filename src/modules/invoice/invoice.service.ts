import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ejs from 'ejs';
import { promises as fs, writeFileSync } from 'fs';
import path, { join } from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { FilePath } from 'src/constants/FilePath';
import { Order } from 'src/entities/order.entity';
import numberToWords from 'src/utils/numberToWords';
import { OrderService } from '../order/order.service';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async generateAndSaveInvoicePdf(order_id: number): Promise<any> {
    const order = await this.orderService.getOrderDetail(order_id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/invoice.ejs',
    );
    const html = await fs.readFile(templatePath, 'utf8');

    const populatedHtml = await this.populateTemplate(html, order.data);

    const pdfBuffer = await this.createPdfBuffer(populatedHtml);
    await this.savePdfToFile(order_id, pdfBuffer);

    const baseUrl = process.env.BASE_URL;
    const fileName = `invoice_${order_id}.pdf`;
    const filePath = join(process.cwd(), 'pdf', fileName);

    writeFileSync(filePath, pdfBuffer);

    const fileUrl = `${baseUrl}/pdf/${fileName}`;

    return { url: fileUrl };
  }

  private async createPdfBuffer(html: string): Promise<Buffer> {
    let browser: Browser | undefined;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBufferUint8: Uint8Array = await page.pdf({ format: 'A5' });
      const pdfBuffer: Buffer = Buffer.from(pdfBufferUint8);

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async savePdfToFile(
    order_id: number,
    pdfBuffer: Buffer,
  ): Promise<string> {
    const pdfDirectory = FilePath.PDF_DIRECTORY;
    const fileName = `invoice_${order_id}.pdf`;
    const filePath = path.join(pdfDirectory, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    return filePath;
  }

  private async populateTemplate(html: any, orderData: Order): Promise<any> {
    const items =
      orderData.items?.map((item) => {
        const quantity = item.quantity || 1;
        const rate = item.price || 0;
        const amount = (quantity * rate).toFixed(2);
        return {
          quantity,
          product: item.product?.name || 'Unknown Product',
          service: item.service?.name || 'No Service',
          category: item.category.name,
          logo: item.product.image,
          rate,
          amount,
        };
      }) || [];

    const totalAmount = orderData.shipping_charges
      ? parseFloat(orderData.total.toString())
      : 0;

    const subTotal = orderData.sub_total
      ? parseFloat(orderData.sub_total.toString())
      : 0;

    const shippingCharges = orderData.shipping_charges
      ? parseFloat(orderData.shipping_charges.toString())
      : 0;
    const expressDeliveryCharges = orderData.express_delivery_charges
      ? parseFloat(orderData.express_delivery_charges.toString())
      : 0;
    const discount = orderData.coupon_discount
      ? parseFloat(orderData.coupon_discount.toString())
      : 0;
    const adjustmentCharges = orderData.kasar_amount
      ? parseFloat(orderData.kasar_amount.toString())
      : 0;

    const paidAmount = orderData.paid_amount
      ? parseFloat(orderData.paid_amount.toString())
      : 0;

    const pendingDueAmount =
      orderData.total - orderData.paid_amount - (orderData.kasar_amount || 0);

    const gst = orderData.gst ? parseFloat(orderData.gst.toString()) : 0;

    const invoiceData = {
      invoiceNumber: orderData.order_id?.toString() || 'N/A',
      customer: {
        name: `${orderData.user?.first_name || ''} ${orderData.user?.last_name || ''}`.trim(),
        contact: orderData.user?.mobile_number?.toString() || 'N/A',
      },
      collectionTime: orderData.estimated_pickup_time
        ? new Date(orderData.estimated_pickup_time).toLocaleString()
        : 'N/A',
      deliveryTime: orderData.estimated_delivery_time
        ? new Date(orderData.estimated_delivery_time).toLocaleString()
        : 'N/A',
      items,
      subTotal: subTotal,
      Gst: gst,
      shippingCharges,
      expressDeliveryCharges,
      discount,
      paidAmount,
      pendingDueAmount,
      adjustmentCharges,
      totalAmount,
      totalInWords: numberToWords(totalAmount),
    };

    return ejs.render(html, { invoice: invoiceData });
  }
}
