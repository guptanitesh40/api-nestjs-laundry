export const getPdfUrl = (order_id: number, file_name: string) => {
  const baseUrl = process.env.BASE_URL;
  const fileName = `${file_name}${order_id}.pdf`;
  const fileUrl = `${baseUrl}/pdf/${fileName}`;

  return { fileUrl, fileName };
};
