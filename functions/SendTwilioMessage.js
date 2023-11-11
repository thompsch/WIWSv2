exports = async function (sender, message) {
  console.log('sending message  to ' + sender + ': ' + message);
  const twilio = require('twilio')(context.environment.values.twilio_account_id,context.environment.values.twilio_auth_token);
  await twilio.messages.create({
    to: sender,
    from: context.environment.values.twilio_from_number,
    body: message,
  });
}