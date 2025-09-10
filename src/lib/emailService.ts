import emailjs from '@emailjs/browser';

// EmailJS configuration - you'll need to set these up in your .env.local
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID_NEW_BOOKING = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_NEW_BOOKING;
const EMAILJS_TEMPLATE_ID_BOOKING_STATUS = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_BOOKING_STATUS;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@vorwerk.com';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface BookingData {
  team_leader_name: string;
  team_leader_id: string;
  email: string;
  phone: string;
  studio: string;
  session: string;
  date: string;
  notes?: string;
  status?: string;
}

// Send email to admin when new booking is submitted
export const sendNewBookingNotification = async (bookingData: BookingData): Promise<boolean> => {
  try {
    const templateParams = {
      to_email: ADMIN_EMAIL,
      to_name: 'Admin',
      from_name: 'Vorwerk Malaysia',
      team_leader_name: bookingData.team_leader_name,
      team_leader_id: bookingData.team_leader_id,
      user_email: bookingData.email,
      phone: bookingData.phone,
      studio: bookingData.studio,
      session: bookingData.session,
      booking_date: new Date(bookingData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      notes: bookingData.notes || 'No additional notes',
      subject: `New Studio Booking Request - ${bookingData.team_leader_name}`,
      message: `A new studio booking request has been submitted by ${bookingData.team_leader_name} (${bookingData.team_leader_id}) for ${bookingData.studio} on ${new Date(bookingData.date).toLocaleDateString()}.`
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_NEW_BOOKING,
      templateParams
    );

    console.log('Admin notification email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
};

// Send email to user when booking status is updated
export const sendBookingStatusNotification = async (
  bookingData: BookingData,
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  console.log('📧 sendBookingStatusNotification called with:', { bookingData, status });
  
  try {
    const isApproved = status === 'approved';
    const statusText = isApproved ? 'Approved' : 'Rejected';
    const statusMessage = isApproved 
      ? 'Your studio booking has been approved! Please arrive 10 minutes before your session time.'
      : 'Unfortunately, your studio booking has been rejected. Please contact admin for more information or try booking a different time slot.';

    const templateParams = {
      to_email: bookingData.email,
      to_name: bookingData.team_leader_name,
      from_name: 'Vorwerk Malaysia',
      team_leader_name: bookingData.team_leader_name,
      team_leader_id: bookingData.team_leader_id,
      studio: bookingData.studio,
      session: bookingData.session,
      booking_date: new Date(bookingData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: statusText,
      status_message: statusMessage,
      subject: `Booking ${statusText} - ${bookingData.studio}`,
      message: statusMessage,
      status_color: isApproved ? '#22c55e' : '#ef4444'
    };

    console.log('📧 Template params for status email:', templateParams);
    console.log('📧 Using service ID:', EMAILJS_SERVICE_ID);
    console.log('📧 Using template ID:', EMAILJS_TEMPLATE_ID_BOOKING_STATUS);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_BOOKING_STATUS,
      templateParams
    );

    console.log('📧 EmailJS response for status notification:', response);
    console.log('✅ User notification email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('❌ Failed to send user notification email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
};

// Validate email configuration
export const validateEmailConfig = (): boolean => {
  const requiredVars = [
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID_NEW_BOOKING,
    EMAILJS_TEMPLATE_ID_BOOKING_STATUS,
    EMAILJS_PUBLIC_KEY
  ];

  const missing = requiredVars.filter(v => !v);
  
  if (missing.length > 0) {
    console.warn('Missing EmailJS configuration. Email notifications will not work.');
    return false;
  }

  return true;
};
