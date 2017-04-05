
'use strict';

var Alexa = require("alexa-sdk");
var ttModule = require('./data/timesTablesLangStrings.js');
var ttLangStrings = ttModule.timesTablesLangStrings;

var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var DELAY_SECS = "0.3s";
var DELAY = "<break time='" + DELAY_SECS + "' /> ";
var TEST_STARTING_NUMBER = 0;

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = ttLangStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

/** TODO
*  1) Add test option Ask: "Read out times tables or start a times tables test?" Currently just reads out choosen times tables.
*  2) Look at ways to do TDD currently just live testing using skills website.
*  3) Remove duplicate intent functions in handlers i.e. stop, cancel, etc.
*  4) Move all speach into resources
**/

var handlers = {
  'LaunchRequest': function () {
      this.emit('GetTimesTable');
  },
  'TimesTablesIntent': function () {
      this.emit('GetTimesTable');
  },
  /** Read out User choosen times tables **/
  'GetTimesTable': function () {
      var timesTableNumber = parseInt(this.event.request.intent.slots.number.value);
      console.log('Times tables selected: ' + timesTableNumber);
      var timesTableResult = "";

      var i = 0;
      while (i < 13) {
        var result = i * timesTableNumber;
        var resultString = i + this.t("TIMES") + timesTableNumber + this.t("IS") + DELAY + result;

        if (i < 12) {
          timesTableResult = timesTableResult.concat(resultString + ", " + DELAY);
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
};

  /** TIMES TABLES TEST
  * Options:
  * 1) Alexa asks 12 random times tables questions between sets 1-12, score tracked and final score given.
  * 2) User selects to be tested on set between 1-12 (in order), if incorrect user can try question again or stop.
  * 3) User selects to be tested on set between 1-12 (in order), score tracked and final score given, with incorrect answers.
  *
  * Proceeding with option 2 until more feedback recieved.
  **/

  var states = {
      ANSWERMODE: '_ANSWERMODE', // User is trying to answer the times table question.
      STARTMODE: '_STARTMODE'  // Prompt the user to start or restart the game.
      DETERMINEMODE: "_DETERMINEMODE" // Determine which times tables the user want to be tested on
  };

  var newTestSessionHandlers = {
    'NewSession': function() {
      this.handler.state = states.STARTMODE;
      this.emit(':ask', 'Welcome to the times tables test. Would you like to start?',
                        'Say yes to start the test or no to quit.');
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':tell', this.t("STOP_MESSAGE"));
    }
  }

  var startTestHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'I will read out a times tables questions, Do you want to start the test?';
        this.emit(':ask', message, message);
    },
    'AMAZON.YesIntent': function() {
        this.handler.state = states.DETERMINEMODE; // determine which times tables to be tested on
        this.emit(':ask', 'Great! What times tables between 2 and 12 would you like to be tested on?.',
                          'Say a number between 2 and 12.');
    },
    'AMAZON.NoIntent': function() {
        console.log("NOINTENT");
        this.emit(':tell', this.t("NEXT_TIME"));
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say yes to continue, or no to end the test.';
        this.emit(':ask', message, message);
    }
  });


  var determineTestHandlers = Alexa.CreateStateHandler(states.DETERMINEMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'What times tables would you like to be tested on?.', 'Say a number between 2 and 12.';
        this.emit(':ask', message, message);
    },
    'AMAZON.DetermineIntent': function() {
        var timesTableNumber = parseInt(this.event.request.intent.slots.number.value);
        this.attributes["timesTableNumber"] = timesTableNumber;
        this.attributes["currentNumber"] = TEST_STARTING_NUMBER;

        this.handler.state = states.ANSWERMODE;
        this.emit(':ask', "What is " +  TEST_STARTING_NUMBER + this.t("TIMES") + timesTableNumber + "?", "Say a number.");
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say yes to continue, or no to end the test.';
        this.emit(':ask', message, message);
    }
  });

  var answerModeHandlers = Alexa.CreateStateHandler(states.ANSWERMODE, {

  });

  var answerAttemptHandlers = {

  };


// end
