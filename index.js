var receiveTransmission = require('./receiver/receiveTransmission.js');
var config = require('./shared/config.js');
var LED = require('./receiver/led.js');
var led = new LED(25,24,23,true);
led.red();

receiveTransmission(config, led, function(error, data) {
  if (error){
    console.log(error);
    led.red();
  }
  else {
    console.log(data);
    led.green();
  }
});
