import { mailService, sendMailWithLayout } from '../services/mail.service';
import * as templates from '../templates/email.templates';

/**
 * Send welcome email to elderly user after registration
 */
export const sendElderlyWelcomeEmail = async (
  email: string,
  name: string,
  tempPassword: string,
  loginUrl: string = 'http://localhost:3000/login'
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Welcome to Silver Walks! 🎉',
    template: templates.elderlyWelcomeTemplate,
    data: {
      name,
      email,
      tempPassword,
      loginUrl,
    },
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetUrl: string,
  expiryTime: string = '1 hour'
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Password Reset Request',
    template: templates.passwordResetTemplate,
    data: {
      name,
      resetUrl,
      expiryTime,
    },
  });
};

/**
 * Send walk scheduled notification
 */
export const sendWalkScheduledEmail = async (
  email: string,
  data: {
    elderlyName: string;
    nurseName: string;
    walkDate: string;
    walkTime: string;
    location: string;
    duration: string;
    nurseInfo?: string;
    viewDetailsUrl: string;
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Walk Scheduled Successfully! 🎉',
    template: templates.walkScheduledTemplate,
    data: {
      elderlyName: data.elderlyName,
      nurseName: data.nurseName,
      walkDate: data.walkDate,
      walkTime: data.walkTime,
      location: data.location,
      duration: data.duration,
      nurseInfo: data.nurseInfo || 'Professional and experienced caregiver',
      viewDetailsUrl: data.viewDetailsUrl,
    },
  });
};

/**
 * Send walk reminder email
 */
export const sendWalkReminderEmail = async (
  email: string,
  data: {
    elderlyName: string;
    walkTime: string;
    location: string;
    nurseName: string;
    manageWalkUrl: string;
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Walk Reminder: Tomorrow at ' + data.walkTime,
    template: templates.walkReminderTemplate,
    data,
  });
};

/**
 * Send walk completed notification
 */
export const sendWalkCompletedEmail = async (
  email: string,
  data: {
    elderlyName: string;
    nurseName: string;
    walkDate: string;
    duration: string;
    distance: string;
    calories: string;
    ratingUrl: string;
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Walk Completed Successfully! 🎊',
    template: templates.walkCompletedTemplate,
    data,
  });
};

/**
 * Send nurse assignment notification
 */
export const sendNurseAssignmentEmail = async (
  email: string,
  data: {
    nurseName: string;
    elderlyName: string;
    requestedDate: string;
    requestedTime: string;
    location: string;
    elderlyAge: number;
    mobilityLevel: string;
    specialNotes?: string;
    acceptUrl: string;
    declineUrl: string;
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'New Walk Request! 🆕',
    template: templates.nurseAssignmentTemplate,
    data: {
      nurseName: data.nurseName,
      elderlyName: data.elderlyName,
      requestedDate: data.requestedDate,
      requestedTime: data.requestedTime,
      location: data.location,
      elderlyAge: data.elderlyAge,
      mobilityLevel: data.mobilityLevel,
      specialNotes: data.specialNotes || 'None',
      acceptUrl: data.acceptUrl,
      declineUrl: data.declineUrl,
    },
  });
};

/**
 * Send subscription renewal reminder
 */
export const sendSubscriptionRenewalEmail = async (
  email: string,
  data: {
    name: string;
    planName: string;
    expiryDate: string;
    walksRemaining: number;
    renewUrl: string;
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Subscription Renewal Reminder 🔔',
    template: templates.subscriptionRenewalTemplate,
    data,
  });
};

/**
 * Send emergency alert email
 */
export const sendEmergencyAlertEmail = async (
  emails: string[],
  data: {
    elderlyName: string;
    location: string;
    alertTime: string;
    alertType: string;
    additionalInfo: string;
    emergencyContacts: string; // HTML list of contacts
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: emails,
    subject: '🚨 Emergency Alert - Immediate Action Required',
    template: templates.emergencyAlertTemplate,
    data,
  });
};

/**
 * Send account verification email
 */
export const sendAccountVerificationEmail = async (
  email: string,
  name: string,
  verificationUrl: string
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Verify Your Email Address ✉️',
    template: templates.accountVerificationTemplate,
    data: {
      name,
      verificationUrl,
    },
  });
};

/**
 * Send payment receipt email
 */
export const sendPaymentReceiptEmail = async (
  email: string,
  data: {
    name: string;
    receiptNumber: string;
    paymentDate: string;
    description: string;
    amount: string;
    receiptUrl: string;
  }
): Promise<void> => {
  await sendMailWithLayout({
    to: email,
    subject: 'Payment Receipt - ' + data.receiptNumber,
    template: templates.paymentReceiptTemplate,
    data,
  });
};
