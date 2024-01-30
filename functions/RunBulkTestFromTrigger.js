exports = async function(changeEvent) {
  try {
    console.log(JSON.stringify(changeEvent.fullDocument));
    var recipients = changeEvent.fullDocument.recipients;
    var message = changeEvent.fullDocument.message.substring(6);
    
    var group = await ParseMessage(recipients)
    
    console.log('Sending ' + group.length + ' messages.');
    
    const sendORama = async () => {
      for (const item of group) {
        //console.log(item.number);
        try{
        await context.functions.execute("SendTwilioMessage", item.number, message);
        } catch {}
      }
    console.log('Items processed:', group.length);
    };

    return await sendORama();
  } catch(err) {
    console.log("error: ", err.message);
  }
};

async function ParseMessage(type){
  var numbers=[];
  const allRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  const testRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("TestRecipients");
  const bulkTestRecipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("BulkTestRecipients");
  
  if (type =='[wiws]')
  {
    return allRecipientsCollection.find({},{'number':1, '_id':0}).toArray();
  } 
  else if (type == '[test]')
  {
    return testRecipientsCollection.find({},{'number':1, '_id':0}).toArray();
  }
  else if (type == '[bulk]')
  {
    //just send to caleb: find({_id:BSON.ObjectId('655bbb1e7c121961dc727aa9')}, etc
    return bulkTestRecipientsCollection.find({},{'number':1, '_id':0}).toArray();
  }
}