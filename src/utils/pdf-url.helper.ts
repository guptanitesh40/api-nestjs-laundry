export const getPdfUrl = (order_id: number, file_name: string) => {
  const baseUrl = process.env.BASE_URL;
  const fileName = `pdf/${file_name}${order_id}.pdf`;
  const fileUrl = `${baseUrl}/${fileName}`;

  return { fileUrl, fileName };
};

export const getRefundFileFileName = () => {
  const file_name = 'refund_receipt_';
  return file_name;
};

export const getOrderLabelFileFileName = () => {
  const file_name = 'order_items_label_';
  return file_name;
};

export const getOrderInvoiceFileFileName = () => {
  const file_name = 'invoice_';
  return file_name;
};
