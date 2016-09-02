var wifi = require('./wifi/wifi.js');
var receiveTransmission = require('./receiver/receiveTransmission.js');
var config = require('./shared/config.js');
var LED = require('./receiver/led.js');
var led = new LED(config.redGPIO, config.greenGPIO, config.blueGPIO, true);

// Do we have a wifi connection?
wifi.getStatus().then((status) => {
  if (status === 'COMPLETED') {
    // If we have a connection, then turn the light green,
    // log the network we're connected to and exit
    showConnection();
  }
  else {
    // If we don't have a connection, turn the light red and try to get one
    led.red();
    setupWifi();
  }
});

// We're connected to wifi. Turn the LED green, log our connected ssid and exit
function showConnection() {
  led.green();
  wifi.getConnectedNetwork()
    .then((ssid) => {
      console.log("Connected to", ssid);
      process.exit();
    })
    .catch(() => process.exit());
}

function setupWifi() {
  // This function gets called if we don't have an active connection
  // when the program starts. Perhaps the device was just turned on
  // and is still trying to connect. Or perhaps this is first time use
  // and we need to configure the device with our wifi credentials.
  // We need to do two things:
  // 1) poll repeatedly for a connection and exit when we get one.
  // 2) listen to the microphone for an acoustic data transfer.

  // Check for wifi every 5 seconds, up to 1 million times.
  wifi.waitForWifi(1000000, 5000).then(() => {
    showConnection();
  })

  // While we're doing that, we also listen for acoustic data transfer of
  // wifi credentials
  receiveTransmission(config, led, function(error, data) {
    if (error){
      console.log(error);
      led.red();
      // XXX: We should play an error sound and try again.
      // But for now we just exit in this case
      process.exit(1);
    }
    else {
      lines = data.split('\n');
      var ssid = lines[0].trim();
      var password = lines[1].trim();
      console.log("Got wifi credentials",
                  "\nssid", ssid,
                  "\npassword:", password);
      wifi.defineNetwork(ssid, password);

      // XXX Hopefully at this point the device will connect and we'll
      // exit. But we should keep listening in case this does not work.
      // receiveTransmission should not use the --rx-one flag, so that
      // it just keeps listening and calls the callback for every
      // batch of data it receives.
    }
  });
}
