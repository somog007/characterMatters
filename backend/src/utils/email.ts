import sgMail from '@sendgrid/mail';
import { Client } from '@sendgrid/client';

const sendGridClient = new Client();
sendGridClient.setApiKey(process.env.SENDGRID_API_KEY!);
if (process.env.SENDGRID_DATA_RESIDENCY === 'eu') {
  sendGridClient.setDataResidency('eu');
}
sgMail.setClient(sendGridClient);

export const sendWelcomeEmail = async (email: string, name: string) => {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL!,
    subject: 'Welcome to VideoEbook Platform',
    html: `
      <h1>Welcome to VideoEbook Platform, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board.</p>
      <p>Start exploring our vast collection of videos and eBooks today!</p>
    `,
  };

  await sgMail.send(msg);
};

export const sendPurchaseConfirmation = async (email: string, ebookTitle: string) => {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL!,
    subject: 'Purchase Confirmation',
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>You have successfully purchased "${ebookTitle}"</p>
      <p>You can now access your eBook from your dashboard.</p>
    `,
  };

  await sgMail.send(msg);
};