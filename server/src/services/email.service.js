import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let cachedTransport = null;

const getTransport = () => {
  if (cachedTransport) return cachedTransport;

  if (env.smtpHost && env.smtpUser && env.smtpPass) {
    cachedTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
    return cachedTransport;
  }

  cachedTransport = nodemailer.createTransport({ jsonTransport: true });
  return cachedTransport;
};

export const sendReservationReminderEmail = async ({
  to,
  guestName,
  hotelName,
  checkInDate,
  roomName
}) => {
  if (!to) return false;

  const transporter = getTransport();
  const formattedCheckInDate = new Date(checkInDate).toISOString().slice(0, 10);

  const message = {
    from: env.smtpFrom,
    to,
    subject: `Your stay at ${hotelName}`,
    text: [
      `Hello ${guestName},`,
      '',
      'Your reservation begins tomorrow.',
      '',
      `Check-in date: ${formattedCheckInDate}`,
      `Room: ${roomName}`,
      '',
      'We look forward to welcoming you.'
    ].join('\n'),
    html: `<h3>Hello ${guestName},</h3><p>Your reservation begins tomorrow.</p><p><strong>Check-in date:</strong> ${formattedCheckInDate}<br/><strong>Room:</strong> ${roomName}</p><p>We look forward to welcoming you.</p>`
  };

  await transporter.sendMail(message);
  return true;
};

const sendTemplateEmail = async ({ to, subject, text, html }) => {
  if (!to) return false;
  const transporter = getTransport();
  await transporter.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html
  });
  return true;
};

export const sendBookingConfirmationEmail = async ({ to, guestName, hotelName, checkInDate, checkOutDate, roomName }) => {
  const checkIn = new Date(checkInDate).toISOString().slice(0, 10);
  const checkOut = new Date(checkOutDate).toISOString().slice(0, 10);
  return sendTemplateEmail({
    to,
    subject: `Booking confirmed at ${hotelName}`,
    text: `Hello ${guestName}, your reservation is confirmed. Check-in: ${checkIn}, Check-out: ${checkOut}, Room: ${roomName}.`,
    html: `<h3>Hello ${guestName},</h3><p>Your reservation is confirmed.</p><p><strong>Check-in:</strong> ${checkIn}<br/><strong>Check-out:</strong> ${checkOut}<br/><strong>Room:</strong> ${roomName}</p>`
  });
};

export const sendWelcomeEmail = async ({ to, guestName, hotelName, roomName }) =>
  sendTemplateEmail({
    to,
    subject: `Welcome to ${hotelName}`,
    text: `Hello ${guestName}, welcome to ${hotelName}. Your room is ${roomName}.`,
    html: `<h3>Welcome ${guestName}</h3><p>Your check-in is complete at <strong>${hotelName}</strong>.</p><p><strong>Room:</strong> ${roomName}</p>`
  });

export const sendThankYouEmail = async ({ to, guestName, hotelName }) =>
  sendTemplateEmail({
    to,
    subject: `Thank you for staying with ${hotelName}`,
    text: `Hello ${guestName}, thank you for staying with us at ${hotelName}.`,
    html: `<h3>Thank you ${guestName}</h3><p>We appreciate your stay at <strong>${hotelName}</strong>.</p>`
  });
