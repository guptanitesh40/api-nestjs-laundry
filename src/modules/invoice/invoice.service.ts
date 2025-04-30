import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ejs from 'ejs';
import * as fs from 'fs';
import { writeFileSync } from 'fs';
import path, { join } from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { RefundStatus } from 'src/enum/refund_status.enum';
import { customerApp } from 'src/firebase.config';
import numberToWords from 'src/utils/numberToWords';
import {
  getGeneralOrderLabelFileFileName,
  getOrderInvoiceFileFileName,
  getOrderLabelFileFileName,
  getPdfUrl,
  getRefundFileFileName,
} from 'src/utils/pdf-url.helper';
import { NotificationService } from '../notification/notification.service';
import { OrderService } from '../order/order.service';
import { PriceService } from '../price/price.service';
import { UserService } from '../user/user.service';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => PriceService))
    private readonly priceService: PriceService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async generateAndSaveInvoicePdf(
    order_id: number,
    regenerate: string,
  ): Promise<any> {
    const order_invoice = getPdfUrl(order_id, getOrderInvoiceFileFileName());
    const file = fs.existsSync(order_invoice.fileName);

    if (file && regenerate !== 'true') {
      return { url: order_invoice.fileUrl };
    }

    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/invoice.ejs',
    );
    const html = fs.readFileSync(templatePath, 'utf8');

    const populatedHtml = await this.populateTemplate(html, order_id);

    const pdfBuffer = await this.createPdfBuffer(populatedHtml);
    await this.savePdfToFile(order_id, pdfBuffer);

    return { statuCode: 200, message: 'Invoice Generate Successfully' };
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
    const invoicePdf = getPdfUrl(order_id, getOrderInvoiceFileFileName());
    const filePath = join(process.cwd(), '', invoicePdf.fileName);

    fs.writeFileSync(filePath, new Uint8Array(pdfBuffer));
    return invoicePdf.fileUrl;
  }

  private async populateTemplate(html: any, order_id: number): Promise<any> {
    const order = await this.orderService.getOrderDetail(order_id);
    const orderData = order.data;

    const deviceTokenCustomer = await this.userService.getDeviceToken(
      orderData.user_id,
    );

    if (deviceTokenCustomer) {
      await this.notificationService.sendPushNotification(
        customerApp,
        deviceTokenCustomer,
        'Your Order Receipt is Ready!',
        `Good news! The receipt for your order #${orderData.order_id} has been generated successfully. You can view it in your account.`,
      );
    }

    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/logo/SC-logo.png',
    );
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const logoUrl = `data:image/png;base64,${logoBase64}`;

    const branchName = orderData.branch?.branch_name;

    const date = orderData.created_at.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const companyName = orderData?.company?.company_name || '';

    const gstIn = orderData.company?.gstin || '';

    const hsnCode = orderData?.company?.hsn_sac_code || '';

    const customerCompanyName = orderData?.gst_company_name || '';

    const custometGstIn = orderData?.gstin || '';

    const companyMsmeNo = orderData?.company?.msme_number || '';

    const signatureImage =
      process.env.BASE_URL + '/' + orderData?.company?.signature_image || '';

    const branchMobileNumber = orderData.branch?.branch_phone_number;
    let itemsTotal = 0;
    let quantity = 0;
    const items =
      orderData.items?.map((item) => {
        quantity = item.quantity || 1;
        const rate = item.price || 0;
        const amount = (quantity * rate).toFixed(2);
        itemsTotal += Number(amount);
        return {
          quantity,
          product: item.product?.name || 'Unknown Product',
          service: item.service?.name || 'No Service',
          category: item.category.name,
          logo: item.product.image,
          rate,
          amount,
          itemsTotal,
        };
      }) || [];

    const totalQty = quantity + quantity;

    const companyGstPercetage = orderData.company?.gst_percentage;

    const inStateGst = companyGstPercetage / 2;

    const addressState = orderData.address.state;

    let cgstPercetage = 0;
    let sgstPercetage = 0;
    let gstPercetage = 0;
    let igstPercetage = 0;

    if (companyGstPercetage === 18) {
      gstPercetage = 1.18;
      cgstPercetage = 0.09;
      sgstPercetage = 0.09;
      igstPercetage = 0.18;
    } else if (companyGstPercetage === 6) {
      gstPercetage = 1.06;
      cgstPercetage = 0.03;
      sgstPercetage = 0.03;
      igstPercetage = 0.06;
    }

    const totalAmount = orderData.total
      ? parseFloat(orderData.total.toString())
      : 0;

    const subTotal = orderData.sub_total
      ? parseFloat(orderData.sub_total.toString())
      : 0;

    const normalDeliveryCharges = orderData.normal_delivery_charges
      ? parseFloat(orderData.normal_delivery_charges.toString())
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

    const gstAmount = totalAmount / gstPercetage;
    const cgstAmount = gstAmount * cgstPercetage;
    const sgstAmount = gstAmount * sgstPercetage;

    const igstAmount = gstAmount * igstPercetage;

    const pendingDueAmount =
      orderData.total -
      orderData.paid_amount -
      (orderData.kasar_amount || 0) -
      (orderData.refund_amount || 0);

    const dueOrder = await this.orderService.pendingDueAmount(
      orderData.user_id,
    );

    const totalPendingDue =
      dueOrder.data.totalPendingAmount - pendingDueAmount || 0;

    const totalDue = totalAmount + totalPendingDue - paidAmount;

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
        ? new Date(new Date().setHours(19, 0, 0, 0)).toLocaleString()
        : 'N/A',

      customerAddress: orderData.address_details || 'N/A',
      items,
      itemsTotal,
      subTotal: subTotal,
      Gst: gst,
      normalDeliveryCharges,
      expressDeliveryCharges,
      discount,
      paidAmount,
      pendingDueAmount,
      adjustmentCharges,
      totalAmount,
      companyName,
      gstIn,
      hsnCode,
      branchName,
      date,
      branchMobileNumber,
      totalInWords: numberToWords(totalAmount),
      logoUrl,
      totalPendingDue,
      totalDue,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      customerCompanyName,
      custometGstIn,
      addressState,
      signatureImage,
      totalQty,
      companyMsmeNo,
      cgstPercetage,
      sgstPercetage,
      gstPercetage,
      inStateGst,
      companyGstPercetage,
    };

    return ejs.render(html, { invoice: invoiceData });
  }

  async generateRefundReceipt(order: any): Promise<any> {
    if (!order) {
      throw new NotFoundException(`Order with id ${order.order_id} not found`);
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

    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/logo/logo.png',
    );
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const logoUrl = `data:image/png;base64,${logoBase64}`;

    const orderItems = order.items.map((item) => ({
      category: item.category ? item.category.name : 'N/A',
      product: item.product ? item.product.name : 'N/A',
      service: item.service ? item.service.name : 'N/A',
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    const refundData = {
      logoUrl,
      order_id: order.order_id,
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
      const refundReceipt = getPdfUrl(order.order_id, getRefundFileFileName());
      const filePath = join(process.cwd(), '', refundReceipt.fileName);

      writeFileSync(filePath, new Uint8Array(pdfBuffer));

      const fileUrl = refundReceipt.fileUrl;

      return { url: fileUrl };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate refund receipt: ${error.message}`,
      );
    }
  }

  async generateOrderLabels(order_id: number): Promise<any> {
    const order = (await this.orderService.getOrderDetail(order_id)).data;

    if (!order) {
      throw new NotFoundException(`Order with ID ${order_id} not found`);
    }

    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/logo/logo.png',
    );
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const logoUrl = `data:image/png;base64,${logoBase64}`;

    const customerName = `${order.user.first_name} ${order.user.last_name}`;
    const date = order.confirm_date
      ? new Date(order.confirm_date).toLocaleDateString()
      : '';

    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/label-template.ejs',
    );

    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const urls = [];

    for (let index = 0; index < order.items.length; index++) {
      const item = order.items[index];

      const service = item.service;
      const serviceName = service.name;

      const product = item.product;
      const productName = product.name;
      const data = {
        logoUrl,
        orderNumber: order.order_id,
        date,
        customerName,
        items: [item],
        itemsQty: item.quantity,
        serviceName,
        productName,
        remarks: item.description,
        itemsLegth: order.items.length,
      };

      const htmlContent = await ejs.renderFile(templatePath, data);

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

      const pdfBuffer = await page.pdf({
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        width: '50mm',
        height: `36mm`,
        preferCSSPageSize: true,
      });

      const orderLabel = getPdfUrl(item.item_id, getOrderLabelFileFileName());

      const outputPath = join(process.cwd(), '', orderLabel.fileName);
      writeFileSync(outputPath, pdfBuffer);

      urls.push(orderLabel.fileUrl);

      await page.close();
    }

    await browser.close();

    return { urls };
  }

  async generateGeneralOrderLabel(order: any): Promise<any> {
    if (!order) {
      throw new NotFoundException(`Order with ID not found`);
    }

    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/logo/logo.png',
    );
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const logoUrl = `data:image/png;base64,${logoBase64}`;

    const customerName = `${order.user.first_name} ${order.user.last_name}`;
    const date = order.confirm_date
      ? new Date(order.confirm_date).toLocaleDateString()
      : '';

    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/general-label-template.ejs',
    );

    const browser: Browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const urls = [];

    const itemQuantity = order.items.reduce(
      (acc, cur) => acc + cur.quantity || 0,
      0,
    );

    const data = {
      logoUrl,
      orderNumber: order.order_id,
      date,
      customerName,
      totalQuantity: itemQuantity,
    };

    const htmlContent = await ejs.renderFile(templatePath, data);

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      width: '50mm',
      height: `30mm`,
      preferCSSPageSize: true,
    });

    const orderLabel = getPdfUrl(
      order.order_id,
      getGeneralOrderLabelFileFileName(),
    );

    const outputPath = join(process.cwd(), '', orderLabel.fileName);
    writeFileSync(outputPath, pdfBuffer);

    urls.push(orderLabel.fileUrl);

    await page.close();

    await browser.close();

    return { urls };
  }

  async generatePriceListPDF(): Promise<any> {
    const base_url = process.env.BASE_URL;

    const prices = await this.priceService.getAll();
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/templates/price-list-template.ejs',
    );

    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src/logo/logo.png',
    );
    const logoBase64 = fs.readFileSync(logoPath, 'base64');
    const logoUrl = `data:image/png;base64,${logoBase64}`;

    const data = { logoUrl, prices };

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const htmlContent = await ejs.renderFile(templatePath, data);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.waitForSelector('img');

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const fileName = 'priceList.pdf';
    const filePath = join(process.cwd(), 'pdf', fileName);
    writeFileSync(filePath, pdfBuffer);

    const fileUrl = `${base_url}/pdf/${fileName}`;
    return { url: fileUrl };
  }
}
