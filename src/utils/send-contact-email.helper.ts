import * as nodemailer from 'nodemailer';
export const sendContactEmail = async (dto) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${dto.full_name}`,
    to: process.env.EMAIL_USER,
    replyTo: dto.email,
    subject: 'New Contact Inquiry',
    text: `
  New contact inquiry received:
  Name: ${dto.full_name}
  Email: ${dto.email}
  Phone: ${dto.mobile_number}
  Message: ${dto.message}
        `,
  };

  await transporter.sendMail(mailOptions);
};
