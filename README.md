# WIWS SMS Alert System

This [Atlas App Services](https://cloud.mongodb.com) app is used to notify the community. The designated administrators can send messages to the community or a smaller test group. They can also add/remove other administrators.

Community members sign up by sending "sub", "subscribe", or "add" to the SMS phone number and then confirm their number with the generated 7-digit code. 

They can remove themselves with "unsub", "unsubscribe", or "remove".

## Setup

### Atlas App Services

1. Create a new app based on this repo.
2. Add three Values to the app:
  - `twilio_account_id`
  - `twilio_auth_token`
  - `twilio_from_number`

  You will have these values after you set up your Twilio account in the next step.

### Twilio
- Create a new Twilio app SMS service.
- Generate a Twilio access token. Save the account id and auth token.
- In your SMS service's Integration section, configure your incoming messages to 
  "Send a webhook". 
  - The URL is in your Atlas App's Http`/incoming` endpoint and will look something like `https://us-east-1.aws.data.mongodb-api.com/app/your_app_id/endpoint/incoming`
  - The HTTP method is POST.


### Atlas Database

1. As configured, the functions expect a database called "WIWS" with the following collections:

    - **Recipients**. The people who have signed up and will receive messages that start with "[wiws]". The schema is:
    &nbsp;

        ```
        _id: "+12345678901"
        number: "+12345678901"
        secret: string
        ```
      Note that the `_id` and `number` are the same, and are in the Twilio-required format of `+(country_code)10-digit-number`

    - **Test_Recipients**. Same schema as "Recipients". These are people who will 
        received messages that start with "[test]".

    - **Admins**. Those who can do All The Things. The schema is:
        &nbsp;
        ```
        _id: "+12345678901"
        number: "+12345678901"
        name: string
        ```
        The `name` field is used only so you can see who's an admin without having to reverse-lookup a person's phone number.


## Testing

1. Send a text message to your Twilio number with "sub". You should receive a text in response with a confirmation code that starts with a "w". Reply with that code and you should get a positive response. 
2. Check your Atlas database and verify you are in the 
`Recipients` collection.
3. Add yourself to `Text_Recipients` and `Admins`.
4. From your phone, you can now send a message that starts with "[wiws]" and receive that message to your phone number from the Twilio number.



