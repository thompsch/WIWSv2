// This function is the endpoint's request handler.
exports = function(response) {
  
  console.log('log response endpoint')
  //console.log(JSON.stringify(response));
  //const {query} = response.query;
  //console.log(JSON.stringify(query));
  const smsStatus = response.query.SmsStatus;
  
  //console.log(response.query.SmsStatus);

if (smsStatus == "failed" || smsStatus == "undelivered"){
  console.error("FAILED or UNDELIVERED")
}
 // const errorsCollection = context.services.get("mongodb-atlas").db("WIWS").collection("Errors");
  //await testRecipientsCollection
  
  
   
};


/*
"{\"query\":
{\"AccountSid\":\"AC5cf4018e80e3e352a7086d6b668d0cf4\",
\"SmsSid\":\"SM0b509b9a0f063121b12bd8c97ec766bf\",
\"To\":\"+14254178292\",
\"RawDlrDoneDate\":\"2310301730\",
\"MessageStatus\":\"delivered\",\"MessageSid\":\"SM0b509b9a0f063121b12bd8c97ec766bf\",\"SmsStatus\":\"delivered\",\"From\":\"+14346089497\",\"MessagingServiceSid\":\"MGf25db88393d345cad2839a2b5b8a4292\",\"ApiVersion\":\"2010-04-01\"},\"headers\":{\"Traceparent\":[\"00-c25613d912414fb2b0d56d2486d788ff-56c8fbb7f7edad97-00\"],\"Content-Type\":[\"application/x-www-form-urlencoded; charset=utf-8\"],\
\"Content-Length\":[\"318\"],\"X-Home-Region\":[\"us1\"],\"X-Request-Id\":[\"61271488-6700-43dc-a9d4-d20a42381627\"],\"X-Forwarded-Proto\":[\"https\"],\"X-Envoy-External-Address\":[\"54.80.65.140\"],\"X-Forwarded-Client-Cert\":[\"By=spiffe://xgen-prod/ns/",
  "[object Binary]"
*/