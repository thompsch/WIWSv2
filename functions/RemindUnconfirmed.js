/* NOTE

The purpose of this function is to be run _manually_ from the testing console
to notify users who signed up but did not confirm their number. 

You should run it first to check the list, then uncomment the line that sends the 
SMS via Twilio. Don't save the funtion with that line uncommented!

*/
exports = async function(){
    const collection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
    
    var f = await collection.find({'secret':{$ne:'confirmed'}}).toArray();
    console.warn('The following numbers are unconfirmed:')
    f.forEach((element) =>{
      console.log(JSON.stringify(element.number));
      var message = "Hi! It looks like you signed up to receive WIWS alerts, but didn't confirm your number. " + 
        "To ensure you get alerts, please respond with the following code: " + element.secret + 
        " If you have any difficulties, please contact the school directly."
        
      /* IMPORTANT: uncomment the following line to send a text to each recipient *after* ensuring the list looks right. 
         Please do not save this function with the next line uncommented.*/
      
      //context.functions.execute("SendTwilioMessage", sender, message);
    });
};
