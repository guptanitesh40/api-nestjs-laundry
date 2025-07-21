import * as ExcelJS from 'exceljs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function exportTotalOrderExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Total Orders');

  worksheet.columns = [
    { header: 'ID', key: 'order_id' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Booking Date', key: 'booking_date' },
    { header: 'Delivery Date', key: 'delivery_date' },
    { header: 'Paid Amount', key: 'paid_amount' },
    { header: 'Total Amount', key: 'total_amount' },
    { header: 'Pending Amount', key: 'pending_amount' },
    { header: 'Kasar Amount', key: 'kasar_amount' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `total-order-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportPaymentTransactionExcel(
  data: any[],
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Total Orders');

  worksheet.columns = [
    { header: 'ID', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Company', key: 'customer_company_name' },
    { header: 'Total Amount', key: 'total_amount' },
    { header: 'Payment Status', key: 'payment_status' },
    { header: 'Payment Type', key: 'payment_type' },
    { header: 'Transaction Id', key: 'transaction_id' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `transaction-report-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportRefundOrderExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Total Orders');

  worksheet.columns = [
    { header: 'ID', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Company', key: 'customer_company_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'GSTIN', key: 'customer_gstin' },
    { header: 'Booking Date', key: 'booking_date' },
    { header: 'Pickup Date', key: 'pickup_date' },
    { header: 'Delivery Date', key: 'delivery_date' },
    { header: 'Refund Amount', key: 'refund_amount' },
    { header: 'Refund Status', key: 'refund_status' },
    { header: 'Refund Date', key: 'refund_date' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `refund-order-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportNotActiveCutomerExcel(
  data: any[],
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Total Orders');

  worksheet.columns = [
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Company', key: 'customer_company_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'GSTIN', key: 'customer_gstin' },
    { header: 'Last Order Date', key: 'last_order_date' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `not-active-customer-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportGstExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Total Orders');

  worksheet.columns = [
    { header: 'Order Number', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Company', key: 'customer_company_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'GSTIN', key: 'customer_gstin' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `gst-report-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportPickupExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pickup');

  worksheet.columns = [
    { header: 'Pickup Date', key: 'pickup_date' },
    { header: 'Pickup Done By', key: 'pickup_boy_name' },
    { header: 'Order Number', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Company Name', key: 'customer_company_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'Customer GSTIN', key: 'customer_gstin' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `pickup-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportDeliveryExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Delivery');

  worksheet.columns = [
    { header: 'Delivery Date', key: 'delivery_date' },
    { header: 'Delivery Done By', key: 'delivery_boy_name' },
    { header: 'Order Number', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Order Number', key: 'order_id' },
    { header: 'Payment Collected', key: 'paid_amount' },
    { header: 'Customer Company Name', key: 'customer_company_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'Customer GSTIN', key: 'customer_gstin' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const fileName = `delivery-${uuidv4()}.xlsx`;
  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}
