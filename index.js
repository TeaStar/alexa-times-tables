
'use strict';

var Alexa = require("alexa-sdk");
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var timesTablesLangStrings;

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = timesTablesLangStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


/** TODO - Read Times Tables
* Create times tables set 2 - 12.
* Ask: which times tables would you like. 2 - 12
* Tell: Read times tables set
* end
* help
* Stop
* Cancel
* help
**/


/** TODO - Times Tables Quiz **/
