exports = async function(phoneNumber, sentSecret){
    console.log('ConfirmNumber: checking', phoneNumber, sentSecret);
    var collection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
    
    return await collection.findOne({_id:phoneNumber}).then(async result=>{
      console.log('findOne result', phoneNumber, JSON.stringify(result));
        if (result === null) { 
          console.error("I can't find a matching phone number");
          return {status: "error", message: "This phone number is not yet in our system. Please 'subscribe' first."};
        }
        var storedSecret = result.secret.toLowerCase();
        
        if (storedSecret === "confirmed")
        {
          return {status: "error", message: "Your number has been confirmed."};
        }
        if (storedSecret === sentSecret.toLowerCase()) {
          console.log('secret matches');
          await collection.updateOne({_id:phoneNumber}, { $set: { "secret": 'confirmed'}});
          return {status: "success", message: "Thank you. Your number has been confirmed."};
        } else {
          return {status: "error", message: "The code you entered didn't match the one we sent."};
        }
      }).catch(err=>{
        console.error(err);
        return {status: "error", message: "That phone number is not yet in our system. Please 'subscribe' first."};
      });
};
