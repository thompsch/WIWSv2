exports = function(type, message){
  var numbers=[];
  const allRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  const testRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("TestRecipients");
  const bulkTestRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("BulkTestRecipients");
  
  if (type.toLowerCase()==="test")
  testRecipientsCollection.find({},{'number':1, '_id':0}).toArray()
    .then(allNumbers =>{
      console.log('found ' + allNumbers.length + ' test recipients.');
      return chunk(allNumbers, message);
    })
  else if (type.toLowerCase()==="bulk"){
    bulkTestRecipientsCollection.find({},{'number':1, '_id':0}).toArray()
      .then(allNumbers =>{
        console.log('found ' + allNumbers.length + ' recipients.');
        return chunk(allNumbers, message);
      })
  } else {
    allRecipientsCollection.find({'secret':'confirmed'},{'number':-1}).toArray()
      .then(allNumbers =>{
        console.log('found ' + allNumbers.length + ' recipients.');
        return chunk(allNumbers, message);
      })
  }
};

//NOTE: added to see if sending 20 messages to Twilio and then pausing would help. It didn't.
async function chunk(numbers, message) {
  if (numbers.length > 0)
  {
    const chunkSize = 20;
    for (let i = 0; i < numbers.length; i += chunkSize) {
        const chunk = numbers.slice(i, i + chunkSize);
        console.log('sending',chunkSize,'messages.');
        send(chunk, message);
        console.log(Date.now());
        await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function send(numbers, message) {
  const twilio = require('twilio')(context.environment.values.twilio_account_id, context.environment.values.twilio_auth_token);
  let msgid = context.environment.values.twilio_messaging_sid;
  
  for (let x in numbers) {
     let n = numbers[x].number;
     console.log('sending to:', JSON.stringify(n));
        
     await twilio.messages
        .create({
           body: message,
           messagingServiceSid: msgid,
           to: n
         })
        .then(console.log('sent to', n))
        .catch(e => { console.error('error:', e.code, e.message); });
    }
}