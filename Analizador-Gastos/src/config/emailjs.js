import emailjs from 'emailjs-com';
import { EMAIL_CONFIG } from './emailConfig';

emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

export const sendEmail = async (templateParams) => {
  try {
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATE_ID,
      templateParams
    );
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};