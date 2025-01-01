export const getRefundReceiptUrl = (order_id: number) => {
  const baseUrl = process.env.BASE_URL;
  const fileName = `refund_receipt_${order_id}.pdf`;
  const fileUrl = `${baseUrl}/pdf/${fileName}`;

  return { fileUrl, fileName };
};
