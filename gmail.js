const qs = require('qs');
const axios = require('axios');
const fs = require('fs');
const credentials = require('./credentials.json');
let {client_id, client_secret, refresh_token, lastMessageTime} = require('./credentials.json');

function Autoreply(){
    const interval = setInterval(() => {
        console.log('Checking for new emails and sending automated response')
        getAccessToken(client_id, client_secret, refresh_token);
    },5000);
}

async function getAccessToken(client_id, client_secret, refresh_token){
    const data = qs.stringify({
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token,
        'grant_type': 'refresh_token'
    });
    
    const getAccessToken = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://accounts.google.com/o/oauth2/token',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data
    };
    try {
        const token =  await axios.request(getAccessToken);
        // createLabel(token.data.access_token)
        return await getMessage(token.data.access_token);
    }
    catch (error) {
        console.log(error);
        return {message:'Something went wrong', error: error.message};
    }
}

async function getMessage(token,id){
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?label=inbox`,
        headers: {
            'Token': token,
            'Authorization': `Bearer ${token}`,
        }
    };

    if(id){
        config.url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`
    }

    try {
        const response = await axios.request(config);

        if(response.data.messages){
            return getMessage(token,response.data.messages[0].id);
        }

        let date = response.data.payload.headers.filter(elem => elem.name == 'Date')[0];
        let to = response.data.payload.headers.filter(elem => elem.name == 'From')[0];
        let subject = response.data.payload.headers.filter(elem => elem.name == 'Subject')[0];
        date = new Date(date.value);

        to = to.value.split('<')[1].trim().split("");
        to.pop();
        to = to.join("").trim();

        // console.log(to, subject, response.data.id, response.data.threadId);
        if(!lastMessageTime){
            credentials.lastMessageTime = date;
            fs.writeFileSync(`${__dirname}/credentials.json`,JSON.stringify(credentials));
        }
        if(date > new Date(credentials.lastMessageTime)){
            getLabels(token).then().catch(err => console.log(err));
            console.log('New message');
            credentials.lastMessageTime = date;
            addLabels(token,id);
            sendReply(token, to, subject.value, response.data.id, response.data.threadId);
            fs.writeFileSync(`${__dirname}/credentials.json`,JSON.stringify(credentials));
        }
        else{
            console.log('No new messages');
        }

        return response.data;
    } catch (error) {
        return {message:'Something went wrong', error:error};
    }
}

async function getLabels(token){
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
        headers: {
            'Token': token,
            'Authorization': `Bearer ${token}`,
        }
    };

    try {
        const response = await axios.request(config);
        const maiLabels = response.data.labels.map(elem => elem = elem.name);
        // console.log(response.data);
        if(!maiLabels.includes('AutoReply')){
            createLabel(token);
        }
        console.log('Checked labels');
        return response.data;
    } catch (error) {
        return {message:'Something went wrong', error:error.message};
    }
}

async function addLabels(token,id){
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
        headers: {
            'Content-type':'application/json',
            'Token': token,
            'Authorization': `Bearer ${token}`,
        },
        data:JSON.stringify({
            "addLabelIds": [
              "Label_3"
            ],
            "removeLabelIds":[]
          })
    };

    try {
        const response = await axios.request(config);
        console.log('added label');
        return response.data;
    } catch (error) {
        console.log({task:"add labels",error:error.message});
        return {message:'Something went wrong', error:error.message};
    }
}

async function createLabel(token){
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
        headers: {
            'Content-type':'application/json',
            'Token': token,
            'Authorization': `Bearer ${token}`,
        },
        data:JSON.stringify({
            "labelListVisibility": "labelShow",
            "messageListVisibility": "show",
            "name": "AutoReply"
        })
    };

    try {
        const response = await axios.request(config);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error.message);
        return {message:'Something went wrong', error:error.message};
    }
}

async function sendReply(token, to, subject, id, threadId){
    body='autogenerated response';
    const messageParts = [];
    messageParts.push(`To: ${to}`);
    messageParts.push(`Subject: Re: ${subject}`);
    messageParts.push(`In-Reply-To:${id}`);
    messageParts.push(`References:${threadId}`);
    messageParts.push("");
    messageParts.push(body);
    
    const email = messageParts.join("\n");

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/send?key=${process.env.APIKey}`,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Token': token,
            'Authorization': `Bearer ${token}`,
        },
        data : JSON.stringify({
            "raw": Buffer.from(email).toString('base64'),
            "threadId": threadId
        })
    };

    
    try {
        const response = await axios.request(config);
        // console.log({response:response.data});
        console.log('Response sent');
        return response.data;
    } catch (error) {
        console.log(error);
        return {message:'Something went wrong', error:error.message};
    }
}

module.exports = {
    Autoreply
}

// getAccessToken(client_id, client_secret, refresh_token).then().catch(err => console.log(err));