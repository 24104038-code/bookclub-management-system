/**
 * =========================================================
 * BOOK FORGE — SMS Gateway Service (server/services/smsService.js)
 * Supports real SMS delivery via Twilio, Fast2SMS, or secure simulation.
 * Uses native Node.js https module (no extra dependencies required).
 * =========================================================
 */

const https = require('https');
const querystring = require('querystring');

/**
 * Send SMS message to real mobile phone number
 * @param {string} toPhoneNumber - E.164 formatted number (e.g. +919876543210, +14155552671)
 * @param {string} messageText - SMS message content
 * @returns {Promise<{success: boolean, provider: string, details?: any}>}
 */
async function sendSms(toPhoneNumber, messageText) {
  const cleanPhone = toPhoneNumber.replace(/[\s\-()]/g, '');

  // 1. Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const result = await sendViaTwilio(twilioSid, twilioAuth, twilioFrom, cleanPhone, messageText);
      console.log(`[SMS Service]: Real SMS sent via Twilio to ${cleanPhone} (SID: ${result.sid})`);
      return { success: true, provider: 'twilio', details: result };
    } catch (err) {
      console.error(`[SMS Service]: Twilio delivery failed for ${cleanPhone}:`, err.message);
    }
  }

  // 2. Check for Fast2SMS Credentials (India +91)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const indianNumber = cleanPhone.replace(/^\+91/, '').replace(/^0/, '');
      const result = await sendViaFast2SMS(fast2smsKey, indianNumber, messageText);
      console.log(`[SMS Service]: Real SMS sent via Fast2SMS to ${cleanPhone}`);
      return { success: true, provider: 'fast2sms', details: result };
    } catch (err) {
      console.error(`[SMS Service]: Fast2SMS delivery failed for ${cleanPhone}:`, err.message);
    }
  }

  // 3. Fallback / Development Simulation
  console.log(`[SMS Service Simulated Delivery]: Real number ${cleanPhone} -> Message: "${messageText}"`);
  return {
    success: true,
    provider: 'simulated',
    simulated: true,
    message: 'SMS logged to server console (configure TWILIO or FAST2SMS for live telco routing).'
  };
}

/**
 * Twilio REST API integration
 */
function sendViaTwilio(accountSid, authToken, fromNumber, toNumber, body) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      To: toNumber,
      From: fromNumber,
      Body: body
    });

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const options = {
      hostname: 'api.twilio.com',
      port: 443,
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `Twilio error HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Fast2SMS API integration (Direct Indian SMS gateway)
 */
function sendViaFast2SMS(apiKey, number, message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      route: 'q',
      message: message,
      language: 'english',
      flash: 0,
      numbers: number
    });

    const options = {
      hostname: 'www.fast2sms.com',
      port: 443,
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || 'Fast2SMS error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = {
  sendSms
};
