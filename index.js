
'use strict';

var Alexa = require("alexa-sdk");
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var ttModule = require('./data/timesTablesLangStrings.js');
var ttLangStrings = ttModule.timesTablesLangStrings;

var delay = "0.3s";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = ttLangStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
  'LaunchRequest': function () {
      this.emit('GetTimesTable');
  },
  'TimesTablesIntent': function () {
      this.emit('GetTimesTable');
  },
  'GetTimesTable': function () {
      var timesTableNumber = parseInt(this.event.request.intent.slots.number.value);
      console.log('Times tables selected: ' + timesTableNumber);
      var timesTableResult = "";

      var i = 0;
      while (i < 13) {
        var result = i * timesTableNumber;
        var resultString = i + " times " + timesTableNumber + " equals <break time='" + delay + "' /> " + result;

        if (i < 12) {
          timesTableResult = timesTableResult.concat(resultString + ", <break time='" + delay + "' />");
        } else {
          timesTableResult = timesTableResult.concat(resultString);
        }
        i++;
      }

      this.emit(':tell', timesTableResult);
  },
  'AMAZON.HelpIntent': function () {
      var speechOutput = this.t("HELP_MESSAGE");
      var reprompt = this.t("HELP_MESSAGE");
      this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
      this.emit(':tell', this.t("STOP_MESSAGE"));
  },
  'AMAZON.StopIntent': function () {
      this.emit(':tell', this.t("STOP_MESSAGE"));
  }

  /** TODO - Times Tables Quiz **/


};
