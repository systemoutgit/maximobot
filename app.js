/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var request=require('request');

var app = express();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-10-21',
  version: 'v1'
});



// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }


if(data.output.text[0].includes("Asset-") & !data.output.text[0].includes('format'))
{

var assetNum = data.output.text[0].split("-");
assetNum=assetNum[1];
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

      request({
          headers: {
            'Authorization': 'Basic bWF4aW1vOnJlbW90ZTE=',
            'Content-Type': 'application/json',
            

          },
          
          url: 'https://maximo-demo75.mro.com/meaweb/os/MXSR',
          body: '<?xml version="1.0" encoding="UTF-8"?><max:CreateMXSR xmlns:max="http://www.ibm.com/maximo" creationDateTime="2008-09-29T07:19:45" >  <max:MXSRSet>    <max:SR action="Create" > <max:ASSETNUM changed="true">'+assetNum+'</max:ASSETNUM> <max:ASSETORGID changed="true">EAGLENA</max:ASSETORGID> <max:ASSETSITEID changed="true">FLEET</max:ASSETSITEID>  <max:AFFECTEDPERSON changed="true">MAXIMO</max:AFFECTEDPERSON>  <max:STATUS maxvalue="string" changed="false">NEW</max:STATUS>   <max:REPORTDATE changed="true">2017-04-06T11:24:06</max:REPORTDATE>    <max:REPORTEDBY changed="true">MAXIMO</max:REPORTEDBY>    </max:SR>  </max:MXSRSet></max:CreateMXSR>',
          method: 'POST'
        }, function (err, resp, body) {
          var ticketidindex = body.search('</TICKETID');

          console.log(body.substring(ticketidindex,ticketidindex-4));
          var ticketid =body.substring(ticketidindex,ticketidindex-4);

          if(resp.body.includes('500')){
          data.output.text[0]=data.output.text[0] +' but there was an error, try with fleet assets e.g 444165';
          return res.json(updateMessage(payload, data));
        }
        else{
      data.output.text[0]=data.output.text[0] +' and SR is'+ticketid;

  return res.json(updateMessage(payload, data));

        }

        });


}


else
    return res.json(updateMessage(payload, data));
    
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {







    return response;
  }

// abhishek enable maximo interatction here 





  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

module.exports = app;
