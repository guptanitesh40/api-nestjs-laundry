import {
  BadRequestException,
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
import { RefundStatus } from 'src/enum/refund_status.enum';
import numberToWords from 'src/utils/numberToWords';
import { OrderService } from '../order/order.service';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {}

  async generateAndSaveInvoicePdf(order_id: number): Promise<any> {
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/invoice.ejs',
    );
    const html = await fs.readFile(templatePath, 'utf8');

    const populatedHtml = await this.populateTemplate(html, order_id);

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

  private async populateTemplate(html: any, order_id: number): Promise<any> {
    const order = await this.orderService.getOrderDetail(order_id);
    const orderData = order.data;

    const branchName = orderData.branch.branch_name;

    const branchMobileNumber = orderData.branch.branch_phone_number;
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
      branchName,
      branchMobileNumber,
      totalInWords: numberToWords(totalAmount),
    };

    return ejs.render(html, { invoice: invoiceData });
  }

  async generateRefundReceipt(order_id: number): Promise<any> {
    const base_url = process.env.BASE_URL;
    const getOrder = await this.orderService.getOrderDetail(order_id);

    const order = getOrder.data;

    if (!order) {
      throw new NotFoundException(`Order with id ${order_id} not found`);
    }

    const {
      address_details,
      total,
      payment_type,
      coupon_code,
      refund_status,
      refund_amount,
    } = order;
    const user = order.user;

    const orderItems = order.items.map((item) => ({
      category: item.category ? item.category.name : 'N/A',
      product: item.product ? item.product.name : 'N/A',
      service: item.service ? item.service.name : 'N/A',
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    const refundData = {
      logoUrl: `${base_url}/images/logo/logo2.png`,
      order_id,
      user: {
        name: `${user.first_name} ${user.last_name}`,
        mobile_number: user.mobile_number,
        email: user.email,
      },
      address_details,
      payment_type,
      coupon_code,
      refund_status: RefundStatus[refund_status],
      refund_amount,
      items: orderItems,
      total_amount: total,
    };

    try {
      const htmlTemplatePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'src/templates/refund-receipt.ejs',
      );

      const htmlContent = await ejs.renderFile(htmlTemplatePath, refundData);

      const browser: Browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBufferUint8: Uint8Array = await page.pdf({
        format: 'A4',
        landscape: false,
      });

      const pdfBuffer: Buffer = Buffer.from(pdfBufferUint8);
      await browser.close();
      const baseUrl = process.env.BASE_URL;
      const fileName = `refund_receipt_${order_id}.pdf`;
      const filePath = join(process.cwd(), 'pdf', fileName);

      writeFileSync(filePath, pdfBuffer);

      const fileUrl = `${baseUrl}/pdf/${fileName}`;

      return { url: fileUrl };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate refund receipt: ${error.message}`,
      );
    }
  }
}
