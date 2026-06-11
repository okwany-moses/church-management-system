import AfricaTalking from 'africastalking';
import twilio from 'twilio';

export async function sendSmsNotification(to: string | string[], message: string) {
  const provider = process.env.SMS_PROVIDER || 'TALKSASA'; // Default to TALKSASA
  const recipients = Array.isArray(to) ? to : to.split(',');

  try {
    console.log(`[SMS Service] Dispatching via ${provider} to ${recipients.length} recipients`);

    if (provider === 'AFRICASTALKING') {
      // Lazy initialization prevents startup crashes if keys are missing
      const at = AfricaTalking({
        username: process.env.AT_USERNAME || 'sandbox',
        apiKey: process.env.AT_API_KEY || '',
      });
      const sms = at.SMS;
      return await sms.send({
        to: recipients,
        message,
        from: process.env.AT_SENDER_ID || undefined,
      });
    }

    if (provider === 'TWILIO') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = process.env.TWILIO_AUTH_TOKEN || '';
      const client = twilio(accountSid, authToken);

      const promises = recipients.map(number =>
        client.messages.create({
          body: message,
          to: number,
          from: process.env.TWILIO_PHONE_NUMBER,
        })
      );
      return await Promise.all(promises);
    }

    if (provider === 'TALKSASA') {
      const talksasaApiKey = process.env.TALKSASA_API_KEY;
      const talksasaSenderId = process.env.TALKSASA_SENDER_ID;

      if (!talksasaApiKey) {
        throw new Error("TalkSasa API Key is not configured in environment variables.");
      }

      // TalkSasa API expects a single comma-separated string for multiple recipients
      const formattedRecipients = recipients.map(number =>
        number.startsWith('+') ? number.substring(1) : number // Remove '+' if present
      ).join(',');

      console.log(`[TalkSasa] Sending to: ${formattedRecipients} with Sender ID: ${talksasaSenderId}`);

      const response = await fetch('https://bulksms.talksasa.com/api/v3/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${talksasaApiKey}` // API Key in Authorization header
        },
        body: JSON.stringify({
          recipient: formattedRecipients, // All recipients in one field
          sender_id: talksasaSenderId,
          type: 'plain', // As per documentation
          message: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TalkSasa API Error: ${response.status} - ${errorText}`);
      }
      return await response.json();
    }

    if (provider === 'CELCOMAFRICA') {
      const partnerID = process.env.CELCOM_PARTNER_ID;
      const apikey = process.env.CELCOM_API_KEY;
      const shortcode = process.env.CELCOM_SHORTCODE;

      const promises = recipients.map(async (number) => {
        // Celcom Africa expects format 254... (no plus sign)
        const mobile = number.startsWith('+') ? number.substring(1) : number;

        // Use URLSearchParams for reliable query string construction
        const params = new URLSearchParams({
          apikey,
          partnerID,
          shortcode,
          mobile,
          message
        });

        const finalUrl = `https://isms.celcomafrica.com/api/services/sendsms/?${params.toString()}`; // Corrected URL
        console.log(`[Celcom Africa] Dispatching to: ${finalUrl.replace(apikey, 'REDACTED')}`);

        const response = await fetch(finalUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Celcom Africa API Error: ${response.status} - ${errorText}`);
        }
        return await response.json();
      });

      return await Promise.all(promises);
    }

    throw new Error(`No valid SMS provider configured: ${provider}`);
  } catch (error) {
    console.error('SMS Service Error:', error);
    throw error;
  }
}