
'use strict';

var Alexa = require("alexa-sdk");
var ttModule = require('./data/timesTablesLangStrings.js');
var ttLangStrings = ttModule.timesTablesLangStrings;

var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var DELAY_SECS = "0.3s";
var DELAY = "<break time='" + DELAY_SECS + "' /> ";
var TEST_STARTING_NUMBER = 0;


var states = {
      STARTMODE: '_STARTMODE',  // Prompt the user to start or restart the game.
      READMODE: '_READMODE', // Reads out selected times table to user.
      TESTMODE: '_TESTMODE',  // Prompt the user to start or restart the game.
      DETERMINEMODE: "_DETERMINEMODE", // Determine which times tables the user want to be tested on
      ANSWERMODE: '_ANSWERMODE', // User is trying to answer the times table question.
      NEXTMODE: '_NEXTMODE' // Prompt the user to ask the next question in the times table (up to 12).
  };

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = ttLangStrings;

    alexa.registerHandlers(launchHandler, welcomeHandler, readTimesTablesHandler, startTestHandlers,
      determineTestHandlers, answerModeHandlers, answerAttemptHandlers);

    alexa.execute();
};

/** TODO
*  1) Add test option Ask: "Read out times tables or start a times tables test?" Currently just reads out choosen times tables.
*  2) Look at ways to do TDD currently just live testing using skills website.
*  3) Remove duplicate intent functions in handlers i.e. stop, cancel, etc.
*  4) Move all speach into resources
**/

var launchHandler = {
  'NewSession': function () {
      this.handler.state = states.STARTMODE;
      this.emit(':ask', this.t(WELCOME_MSG), this.t(WELCOME_MSG));
  },
  'AMAZON.HelpIntent': function () {
      this.emit(':ask', this.t(WELCOME_MSG), this.t(WELCOME_MSG));
  },
  'AMAZON.CancelIntent': function () {
      this.emit(':tell', this.t("STOP_MESSAGE"));
  },
  'AMAZON.StopIntent': function () {
      this.emit(':tell', this.t("STOP_MESSAGE"));
  },
  'Unhandled': function() {
      console.log("launchHandler UNHANDLED");
      this.emit(':ask', this.t(WELCOME_MSG), this.t(WELCOME_MSG));
  }
};

var welcomeHandler = Alexa.CreateStateHandler(states.STARTMODE, {
  'WelcomeIntent': function () {
    var welcomeAnswer = this.event.request.intent.slots.option.value;
    console.log("Welcome answer: " + welcomeAnswer);

    if (welcomeAnswer === 'read') {
      this.handler.state = states.READMODE;
      this.emit('TimesTablesIntent');
    } else if (welcomeAnswer === 'test') {
      this.handler.state = states.TESTMODE;
      this.emit('TestSession');
    }
  },
  'AMAZON.HelpIntent': function () {
      this.emit(':ask', this.t(WELCOME_MSG), this.t(WELCOME_MSG));
  },
  'AMAZON.CancelIntent': function () {
      this.emit(':tell', this.t("STOP_MESSAGE"));
  },
  'AMAZON.StopIntent': function () {
      this.emit(':tell', this.t("STOP_MESSAGE"));
  },
  'Unhandled': function() {
      console.log("welcomeHandler UNHANDLED");
      var message = 'Just say \'read\' or \'test\'';
      this.emit(':ask', message, message);
  }
});

var readTimesTablesHandler = Alexa.CreateStateHandler(states.READMODE, {
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
  },
  'Unhandled': function() {
      console.log("readTimesTablesHandler UNHANDLED");
      var speechOutput = this.t("HELP_MESSAGE");
      var reprompt = this.t("HELP_MESSAGE");
      this.emit(':ask', speechOutput, reprompt);
  }
});


  /** TIMES TABLES TEST
  * Options:
  * 1) Alexa asks 12 random times tables questions between sets 1-12, score tracked and final score given.
  * 2) User selects to be tested on times tables between 1-12 (in order), if correct next question asked, if incorrect user can try question again or stop.
  * 3) User selects to be tested on times tables between 1-12 (in order), score tracked and final score given, with incorrect answers.
  *
  * Proceeding with option 2 until more feedback recieved.
  **/

  // var newTestSessionHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
  //   'TestSession': function() {
  //     this.handler.state = states.TESTMODE;
  //     this.emit(':ask', 'Welcome to the times tables test. Would you like to start?',
  //                       'Say yes to start the test or no to quit.');
  //   },
  //   "AMAZON.StopIntent": function() {
  //     this.emit(':tell', this.t("STOP_MESSAGE"));
  //   },
  //   "AMAZON.CancelIntent": function() {
  //     this.emit(':tell', this.t("STOP_MESSAGE"));
  //   },
  //   'SessionEndedRequest': function () {
  //       console.log('session ended!');
  //       this.emit(':tell', this.t("STOP_MESSAGE"));
  //   },
  //   'Unhandled': function() {
  //       console.log("UNHANDLED");
  //       var message = 'Say yes to start the test or no to quit.';
  //       this.emit(':ask', message, message);
  //   }
  // });

  var startTestHandlers = Alexa.CreateStateHandler(states.TESTMODE, {
    'TestSession': function () {
        this.emit('TestSession'); // Uses the handler in TestSessionHandlers
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
        console.log("startTestHandlers UNHANDLED");
        var message = 'Say yes to continue, or no to end the test.';
        this.emit(':ask', message, message);
    }
  });

  var determineTestHandlers = Alexa.CreateStateHandler(states.DETERMINEMODE, {
    'TestSession': function () {
        this.emit('TestSession'); // Uses the handler in TestSessionHandlers
    },
    'DetermineIntent': function() {
        var timesTableNumber = parseInt(this.event.request.intent.slots.number.value);
        this.attributes["timesTableNumber"] = timesTableNumber;
        this.attributes["currentNumber"] = TEST_STARTING_NUMBER;

        this.handler.state = states.ANSWERMODE;
        this.emit(':ask', "What is " +  TEST_STARTING_NUMBER + this.t("TIMES") + timesTableNumber + "?", "Say a number.");
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'What times tables would you like to be tested on?.', 'Say a number between 2 and 12.');
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
        console.log("determineTestHandlers UNHANDLED");
        var message = 'Say yes to continue, or no to end the test.';
        this.emit(':ask', message, message);
    }
  });

  var answerModeHandlers = Alexa.CreateStateHandler(states.ANSWERMODE, {
    'TestSession': function () {
        this.handler.state = '';
        this.emitWithState('TestSession'); // Equivalent to the Start Mode TestSession handler
    },
    'AnswerIntent': function() {
      var answer = parseInt(this.event.request.intent.slots.number.value);
      var timesTableNumber = this.attributes["timesTableNumber"];
      var currentNumber = this.attributes["currentNumber"];
      console.log("question: " + currentNumber + " * " + timesTableNumber + ", answer given:" + answer);

      if (isNan(answer)) {
        console.log(answer + " is not a number!")
        this.emit('NotANum');

      } else if (currentNumber * timesTableNumber === answer) {
        console.log("Answer correct!");

        // With a callback, use the arrow function to preserve the correct 'this' context
        this.emit('Correct', () => {
            // ask next question or ask if they would like to continue?
            // next question
            currentNumber++;
            if (currentNumber === 12) {
              // end test
            } else {
              this.attributes["currentNumber"] = currentNumber;
              this.emit(':ask', "OK, What is " +  currentNumber + this.t("TIMES") + timesTableNumber + "?", "Say a number.");
            }
            // ask to continue to next question
            // this.emit(':ask', answer.toString() + 'is correct! Would you like the next question?',
            // 'Say yes for your next question, or no to end the test.');
          })
      } else {
        console.log("Incorrect answer " + answer);
        this.emit('Incorrect');
      }
    },
    'AMAZON.HelpIntent': function() {
      var timesTableNumber = this.attributes["timesTableNumber"];
      var currentNumber = this.attributes["currentNumber"];

      this.handler.state = states.ANSWERMODE;
      this.emit(':ask', "What is " +  currentNumber + this.t("TIMES") + timesTableNumber + "?", "Say a number.");
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
        console.log("answerModeHandlers UNHANDLED");
        var message = 'Say yes to continue, or no to end the test.';
        this.emit(':ask', message, message);
    }
  });

  var answerAttemptHandlers = {
    'Correct': function() {
        this.handler.state = states.ANSWERMODE;
        callback();
    },
    'Incorrect': function() {
      this.emit(':ask', 'Sorry, that is incorrect. Try again by saying a number.', 'Try again by saying a number.');

    },
    'NotANum': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }
  };
