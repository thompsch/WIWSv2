//Ttest with this changeevent:

/* exports({
'_id':{'_data':'foo'},
'operationType':'insert',
'fullDocument':{
  '_id':'65b822ca63bd6e3479cfb650',
  'message':'[bulk] Bulk t3st 6.',
  'recipients':'[bulk]',
  'dateSent':'2024-01-29T22:12:26.119Z'
}})*/

exports = async function(changeEvent) {
  try {
    const recipients = changeEvent.fullDocument.recipients; // [wiws],[test], or [bulk]
    var message = changeEvent.fullDocument.message.substring(6);
    const dateSent = changeEvent.fullDocument.dateSent;
    const values = await ParseMessage(recipients);
    
    if (recipients == '[bulk]'){
      //console.log(JSON.stringify(values[1]))
      message += " Please reply with 'bt" + values[1] + "'";
      console.log(message);
    }
    
    console.log(JSON.stringify(values[0]));
    console.log('Sending ' + values[0].length + ' messages.');
    
    const sendFunction = async () => {
      var sent = 0;
      for (const item of values[0]) {
        //console.log(item.number);
        try{
        await context.functions.execute("SendTwilioMessage", item.number, message);
        sent = sent+1;
        } catch(e) {
          console.log('error executing SendTwilioMessage function.', e);
        }
      }
    console.log('Messages sent:', sent);
    };
    return await sendFunction();
    
  } catch(err) {
    console.log("error: ", err.message);
  }
};

async function ParseMessage(type){
  var numbers=[];
  const allRecipientsCollection =       context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  const testRecipientsCollection =      context.services.get("mongodb-atlas").db("WIWS").collection("TestRecipients");
  const bulkTestRecipientsCollection =  context.services.get("mongodb-atlas").db("WIWS").collection("BulkTestRecipients");
  const bulkTestsCollection =           context.services.get("mongodb-atlas").db("WIWS").collection("BulkTests");
  
  if (type =='[wiws]')
  {
    return [await allRecipientsCollection.find({},{'number':1, '_id':0}).toArray(), null];
  } 
  else if (type == '[test]')
  {
    return [await testRecipientsCollection.find({},{'number':1, '_id':0}).toArray(), null];
  }
  else if (type == '[bulk]')
  {
    const latest = await bulkTestsCollection.find({},{_id:0, testId:1}).sort({_id:-1}).limit(1).toArray(); //find most recent testId
    //console.log(JSON.stringify(latest))
    var latestId = latest[0].testId;
    
    //console.log(latestId);
    
    if (isNaN(latestId) || latestId == null || latestId == undefined){
      console.log('here')
      latestId = 0;
    } else {
      console.log('or here?')
      latestId = latestId +1;
    }
    console.log(latestId);

    await bulkTestsCollection.insertOne({testDateTime:new Date(), testId:latestId});
  }
    return [await bulkTestRecipientsCollection.find({},{'number':1, '_id':0}).toArray(), latestId]; 
}