exports = async function(phoneNumber, message){
    console.log('ConfirmNumber: checking', phoneNumber, message);
    // message must be in formation 'btN', where N is the test id
    var test_id = message.substring(2);
    console.log(test_id)
    var recipientsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("BulkTestRecipients");
    //var testCollection = context.services.get("mongodb-atlas").db("WIWS").collection("BulkTests");
    try {
      const testid = parseInt(test_id);
      
      // add this if we need to test whether the test actully exists. Like if use types wrong number?
      /*var latestTest = await testCollection.find({testId:testid}).toArray();
      if (latestTest==null){
        console.error("latestTest is null (not found). Check ConfirmBulkTest function!");
        return {status: "error", message: ''};
      }*/
      
      var tester = await recipientsCollection.updateOne({'number':phoneNumber}, {$addToSet:{'testResponses':testid}});
      return {status: "success", message: 'Thank you for confirming.'};
    }
    catch(err){
          console.error(err);
          return {status: "error", message: err};
    }
  }