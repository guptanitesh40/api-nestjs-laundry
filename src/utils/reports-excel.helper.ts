import * as ExcelJS from 'exceljs';
import * as path from 'path';

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

  const reportName = 'Total-orders-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportPaymentTransactionExcel(
  data: any[],
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Payment Transaction');

  worksheet.columns = [
    { header: 'ID', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Total Amount', key: 'total_amount' },
    { header: 'Payment Status', key: 'payment_status' },
    { header: 'Payment Type', key: 'payment_type' },
    { header: 'Transaction Id', key: 'transaction_id' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const reportName = 'Transaction-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportRefundOrderExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Refund Orders');

  worksheet.columns = [
    { header: 'ID', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Address', key: 'address_details' },
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

  const reportName = 'Refund-Orders-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportNotActiveCutomerExcel(
  data: any[],
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Not Active Customer');

  worksheet.columns = [
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'Last Order Date', key: 'last_order_date' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const reportName = 'Not-Active-Customer-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}

export async function exportGstExcel(data: any[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Gst');

  worksheet.columns = [
    { header: 'Order Number', key: 'order_id' },
    { header: 'Company', key: 'company' },
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Customer Address', key: 'address_details' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const reportName = 'Gst-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

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
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Total Amount', key: 'total_amount' },
    { header: 'Paid Amount', key: 'paid_amount' },
    { header: 'Pending Amount', key: 'pending_amount' },
    { header: 'Payment Status', key: 'payment_status' },
    { header: 'Kasar Amount', key: 'kasar_amount' },
    { header: 'Delivery Collect Amount', key: 'delivery_collect_amount' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const reportName = 'Pickup-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

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
    { header: 'Branch', key: 'branch' },
    { header: 'Customer Name', key: 'customer_name' },
    { header: 'Order Number', key: 'order_id' },
    { header: 'Customer Company Name', key: 'customer_company_name' },
    { header: 'Customer Address', key: 'address_details' },
    { header: 'Total Amount', key: 'total_amount' },
    { header: 'Paid Amount', key: 'paid_amount' },
    { header: 'Pending Amount', key: 'pending_amount' },
    { header: 'Payment Status', key: 'payment_status' },
    { header: 'Kasar Amount', key: 'kasar_amount' },
    { header: 'Delivery Collect Amount', key: 'delivery_collect_amount' },
  ];

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  worksheet.addRows(data);

  const reportName = 'Delivery-Report';
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const fileName = `${reportName}-${dateStr}.xlsx`;

  const exportPath = path.join(__dirname, '..', '..', 'pdf', fileName);
  await workbook.xlsx.writeFile(exportPath);

  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}/pdf/${fileName}`;
}
