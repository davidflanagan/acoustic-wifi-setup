var spawn = require('child_process').spawn;
var unwrap = require('../shared/wrapper.js').unwrap;

module.exports = function receiveTransmission(config, led, callback) {
  config = config || {}
  var command = 'minimodem';

  var args = [
    '-r',
    '--rx-one',
    String(config.bitsPerSecond) || 300,
    '-M',
    String(config.markFrequency) || 4500,
    '-S',
    String(config.spaceFrequency) || 3000,
  ];

  if (config.syncByte) {
    args.push('--sync-byte=0x' + config.syncByte.toString(16));
  }

  // On my raspberry pi, minimodem needs to be run with -A because
  // I don't have PulseAudio installed
  if (config.requiresDashA) {
    args.push('-A');
  }

  var minimodem = spawn(command, args);
  var stdout = "";
  var stderr = "";
  var blue = false;


  minimodem.stderr.on('data', (data) => {
    stderr += data;
    // Minimodem outputs to stderr when it first detects the carrier signal
    // and again when it loses the carrier at the end of the transmission
    // Make sure the led is blue when this happens
    if (!blue) {
      led.blue();
      blue = true;
    }
  });

  minimodem.stdout.on('data', (data) => {
    stdout += data;

    // Toggle the led on or off each time we get data on stdout.
    // this should make it blink on or off for each character we receive
    if (blue) {
      led.off();
      blue = false;
    }
    else {
      led.blue();
      blue = true;
    }
  });
  

  minimodem.on('close', (code) => {
    var result = null, error = null;

    try {
      result = unwrap(stdout);
    }
    catch(e) {
      var stats = {received: stdout};
      var words = stderr.split(' ');
      words.forEach((w) => {
        var parts = w.split('=');
        if (parts.length === 2) {
          stats[parts[0]] = parts[1];
        }
      })

      error = new Error(e.message + ' ' + JSON.stringify(stats));
    }

    callback(error, result);
  });

};
