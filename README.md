# Listed Assignment

1. Overview
- This is doccumentation for Gmail Autoresponder API (gmaiListed).
- The app is built to check users's inbox after certain amount of time and reply to the messages that do not have prior replies.
- The app also adds labels to the messages that have been replied by the system

2. Endpoints
    - `/`
        - Method: `GET`
        - Parameters: none
        - response: `Html Page`
    
    - `/gmaiListed`
        - Method: `GET`
        - This endpoints redirects user for google authentication
        - Parameters: none
        - response: `code as url query`
   
    - `/gmaiListed/auth`
        - Method: `GET`
        - This endpoints shows success message (HTML Page) after successful authentication
        - Parameters: none
        - response: `Html Page`

3. Quick start guide
    - The app needs some credentials like client_Id and client_secret to work.
    - User needs to visit the url with `/` endpoint (`http://localhost:7000/`);
    - The welcome page will let user authenticate himself/herself.
    - The app authenticates user using google O-auth.
    - after successful authentication, the app redirects user to the respective html page and starts the responding procedure.

4. Implementation
    - `getToken()`
        - It fetches an access_token from google using respective credentials.
        - The token will furthur be used to call diffrent API's.
        - After successful execution, the function makes a call to `getMessages()`
    - `getMessages()`
        - This funcntion retrieves messages from the user inbox.
        - It makes use of the token generated by `getToken()`;
        - After fetchfing all messages, it checks for message dates and compares it with the date of last message recieved.
        - If last message date is not available, it saves the current message date as last message date.
        - After saving the date, it calls `getLabels()` with access_token.
        - When desired label is found/created it calls `addLabel()`
        - After labels are done, it calls `sendReply()` with necessary parameters.

    - `getLabels()`
        - this function retrieves all labels of the user to ckeck if the required label is present of not.
        - If it is not present it will call `createLabel()`

    - `createLabel()`
        - This function will create a perticular label which is supposed to be added to the new messages.
    
    - `sendReply()`
        - This function will send a reply to the perticular message.
        - The content of the reply is alredy in the system, it sends it to the perticular user

    - `Autoreply()`
        - This function is responsible for repeating all the steps after certain amount of time.
        - It will make call to `getToken()`, which will furthur call diffrent functions.

5. Technologies
    - NodeJS: This app is built on the top if node, backend processes are handled using NodeJS
    - ExpressJS: endpoints which helps user interact with the app is created using expressJS.
    - Axios: axios is used to make requests to Gmail API's.
    - GmailAPI: GmailAPI url's have been taken from official documentation of google at `https://developers.google.com/gmail/api/reference/rest`

6. Imprevents to be done
    - The app can be deployed, so that it can be accessed online.
    - The app can let user create a label of his/her choice.
    - There can also be feature of modifying and deleting labels.
    - The system can allow users to set specific responses for specific users.
    - There could be functionlity of setting a timer, or scheduling a message.