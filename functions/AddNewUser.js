exports = async function(phone){
  console.log('adding phone', phone)
  const collection = context.services.get("mongodb-atlas").db("WIWS").collection("Recipients");
  
  var secret = generateDeviceCode();
  
  return await collection.insertOne({ '_id': phone, 'number': phone, 'secret': secret, 'addedOn': new Date() })
  .then(r => {
    console.log('added phone', JSON.stringify(r));
    return {'error':null, 'message' : secret};
  })
  .catch(async error => {
    
    console.log(error);
    
    if (error.toString().indexOf('E11000') >= 0) // phone number is already in the system
    {
      return await collection.findOne({ '_id': phone})
      .then(async doc => {
        if (doc.secret == 'confirmed'){
          return {'error':'duplicate_key', 'message' : 'Your number is already in the system and confirmed to receive messages. If you want to stop receiving messages, please reply with "unsub".'};
        } else {
          return {'error':'duplicate_key', 'message' : 'Your number is in the system, but not yet confirmed. Please reply with the follwing code: ' + doc.secret};
        }
      });
      
    } else {
      return {'error': 'other error', 'message': null};
    }
  });
}

function generateDeviceCode() {
  // Generate a 7-digit 2fa code
    const genCodePart = () => {
      const part = Math.floor(Math.random() * 1000);
      return part.toString().padStart(3, 0);
    };
    const code = "w" + genCodePart(3) + genCodePart(3);
    return code;
  }