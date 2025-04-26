const functions = require('firebase-functions');
const twilio = require('twilio');

// Configura tus credenciales de Twilio
const client = twilio(
  'TU_TWILIO_ACCOUNT_SID',
  'TU_TWILIO_AUTH_TOKEN'
);

exports.sendSMS = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { to, message } = req.body;

  try {
    await client.messages.create({
      body: message,
      to: to,
      from: 'TU_NUMERO_TWILIO' // Número proporcionado por Twilio
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Error sending SMS' });
  }
});