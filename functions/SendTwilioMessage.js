exports = async function (recipient, message) {
  console.log('sending message  to ' + recipient + ': ' + message);
  const twilio = require('twilio')(context.environment.values.twilio_account_id,context.environment.values.twilio_auth_token);
  await twilio.messages.create({
    to: recipient,
    from: context.environment.values.twilio_from_number,
    body: message,
  });
}