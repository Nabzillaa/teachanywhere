import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;

export interface SendEmailParams {
  to_email: string;
  subject: string;
  message: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY);
}
