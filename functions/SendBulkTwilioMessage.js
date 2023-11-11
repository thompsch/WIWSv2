exports = async function(type, message){
  var numbers=[];
  const allRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  const testRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("TestRecipients");
  
  if (type.toLowerCase()==="test")
  await testRecipientsCollection.find({},{'_id':1}).toArray().then(allNumbers =>{
    allNumbers.forEach(n=>{
      numbers.push(n._id)
    })
      console.log('found numbers:', JSON.stringify(numbers));
  })
  else{
  await allRecipientsCollection.find({'secret':'confirmed'},{'_id':1}).toArray().then(allNumbers =>{
    allNumbers.forEach(async n=>{
      numbers.push(n._id)
    })
      console.log('found numbers:', JSON.stringify(numbers));
  })
  }
  console.log('sending to Twilio:', message);
    
  if (numbers.length>0)
  {
    //console.log(context.environment.values.twilio_account_id,context.environment.values.twilio_auth_token,context.environment.values.twilio_from_number)
    const twilio = require('twilio')(context.environment.values.twilio_account_id,context.environment.values.twilio_auth_token);
 
    numbers.forEach(async n=>{
      await twilio.messages.create({
        to: n,
        from: context.environment.values.twilio_from_number,
        body: message,
      })
    });
  }
};