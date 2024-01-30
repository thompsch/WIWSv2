/* NOTE

To test this function, run exports({"query":{"Body":"Sub","From":"+14254178292"}});

- Change the Body value to whichever command you are testing.
- Change the phone number to whichever phone number you are sending from.
Another example: 
exports({"query":{"Body":"[test] Hi testers! I'm testing a small change to the system.","From":"+14254178292"}});

*/
exports = async function(query, response) {
  
  var sender = query.query.From;
  var message = query.query.Body;

  if (message == '' || message == undefined || message == null) return;
  
  message = message.trim();
  console.log('received message', message);
  
  const adminCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Admins");
  var admin = await adminCollection.findOne({'phone':sender});
  
  var isAdmin = admin != null; 
  
  if (isAdmin) //message from an admin
  { 
    if (message.toLowerCase().startsWith('[wiws]') || message.toLowerCase().startsWith('[test]') || message.toLowerCase().startsWith('[bulk]'))
    {
      const alertCollection = context.services.get("mongodb-atlas").db("WIWS").collection("AlertMessages");
      //console.log(JSON.stringify({ 'messsage': message, 'recipients':  message.slice(0,6).toLowerCase(), 'dateSent': new Date() }));
      alertCollection.insertOne({ 'message': message, 'recipients':  message.slice(0,6).toLowerCase(), 'dateSent': new Date() })
    }
    else if (message.toLowerCase().startsWith('add admin'))
    {
      let parts = message.trim().split(" ");
      if (parts.length < 3) console.error("error parsing number to add as admin. Message was:", message);
      console.log('Adding as admin:', parts[2])
      return await addAdmin(sender, parts[2]);
    }
    else if (message.toLowerCase().startsWith('remove admin'))
    {
      let parts = message.trim().split(" ");
      if (parts.length < 3) console.error("error parsing number to remove as admin. Message was:", message);
      console.log('Removing as admin:', parts[2])
      return await removeAdmin(sender, parts[2]);
    }
    else if (message.startsWith('admin'))
    {
      return await context.functions.execute("SendTwilioMessage", sender, "Admin: precede your message with '[wiws]' to go to everyone, '[test]' for limited beta testers, '[bulk]' for all beta testers, 'add admin +12345678901' or 'remove admin +12345678901'.");
    } else if (message.toLowerCase().startsWith("bt")) {// admin bulk test response
      console.log('here', message);
      return handleBulkTestReponse(sender, message);
    }
    else {
      return await context.functions.execute("SendTwilioMessage", sender, "Hi Admin. I don't know what you want to do -- try texting 'admin' for options.");
    }
  }
  
  else // message from a recipient or new
  {
    if (message.toLowerCase() == "add" || message.toLowerCase() == "sub" || message.toLowerCase() == "subscribe")
    {
      return await addNewUser(sender);
    } else if (message.toLowerCase() == "remove" || message.toLowerCase() == "unsub" || message.toLowerCase() == "unsubscribe")
    {
      return await removeUser(sender);
    } else if (message.toLowerCase().startsWith("w")) //new user confirmation
    {
      await context.functions.execute("ConfirmNumber",sender, message)
      .then(async result =>{
        console.log('result', JSON.stringify(result));
        return await context.functions.execute("SendTwilioMessage", sender, result.message);
      });
    } else if (message.toLowerCase().startsWith("a")) //new admin confirmation
    {
      await context.functions.execute("ConfirmNewAdmin", sender, message)
      .then(async r=>{
        console.log('result', JSON.stringify(r));
        return context.functions.execute("SendTwilioMessage", sender, r.message);
      });
    } else if (message.toLowerCase().startsWith("bt")) // bulk test response
    {
      return handleBulkTestReponse(sender, message);
    }
    else {
      console.log('message ignored', message, sender)
    }
  }
}

async function handleBulkTestReponse(sender, message){
  await context.functions.execute("ConfirmBulkTest", sender, message)
      .then(async r=>{
        console.log('result', JSON.stringify(r));
        return context.functions.execute("SendTwilioMessage", sender, r.message);
      });
}

async function addNewUser(sender){
  context.functions.execute("AddNewUser", sender)
    .then((result) => {
      //console.log(JSON.stringify(result));
      var message = result.message;
      console.log('adding new user result:', sender, message);
      if (result.error == "duplicate_key"){
        context.functions.execute("SendTwilioMessage", sender, message);
      } 
      else if (result.error != null && result.error != '')
      {
        context.functions.execute("SendTwilioMessage", sender, "There was an error adding your number.");
        console.error("An error ocurred adding a new user.", sender);
      } 
      else if (message.toString().startsWith("w")) 
      {
        console.log('new code' + message.toString())
        context.functions.execute("SendTwilioMessage", sender, 'Please confirm your message by replying with this code: ' + message.toString());
      }
    });
}

async function removeUser(sender){
  const recipientCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  var result = await recipientCollection.deleteOne({ '_id': sender });
  return context.functions.execute("SendTwilioMessage", sender, "Your number has been removed from the system. If you want to start receiving messages again, send 'sub' or 'add'.");
}

async function addAdmin(sender, numberToAdd){
  const recipientCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  recipientCollection.findOne({ '_id' : numberToAdd})
    .then(async (result) => {
      if (result == null) {
        console.error('Admin is trying to add a phone number that is not in the recipients list yet.', numberToAdd);
        return await context.functions.execute("SendTwilioMessage", sender, "The number you are trying to add as an admin is not in the system. Please confirm that they have already signed up and you have entered the correct number.")
      }
      else {
        var secret = generateDeviceCode();
        await recipientCollection.updateOne({'_id':numberToAdd}, { $set: { 'pending_admin_secret': secret}})
          .then(async ()=>{
            await context.functions.execute("SendTwilioMessage", sender, "A message has been sent to " + numberToAdd + " to confirm. Reply with 'remove admin " + numberToAdd + "' if this was a mistake.");
            return await context.functions.execute("SendTwilioMessage", numberToAdd, "You have been added as an admin. Please reply with the following code to confirm: " + secret.toString());
          });
      }
    });
}

async function removeAdmin(sender, numberToRemove){
  const adminCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Admins");
  adminCollection.deleteOne({ '_id' : numberToRemove})
    .then(async (result) => {
      console.log('Admin removed:', result);
      return  await context.functions.execute("SendTwilioMessage", sender, "Success: " + numberToRemove + " is no longer an admin.");
  });
  
  const recipientCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  return await recipientCollection.updateOne({'_id':numberToRemove}, { $unset: { 'pending_admin_secret': null}});
}

function generateDeviceCode() 
{
    const genCodePart = () => {
      const part = Math.floor(Math.random() * 1000);
      return part.toString().padStart(3, 0);
    };
    const code = "a" + genCodePart(3) + genCodePart(3);
    return code;
}
