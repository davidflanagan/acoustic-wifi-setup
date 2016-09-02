var spawnSync = require('child_process').spawnSync;
var unwrap = require('../shared/wrapper.js').unwrap;

module.exports = function receiveTransmission(config) {
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

  var result = spawnSync(command, args, {encoding:'utf8'});

  try {
    var message = unwrap(result.stdout);
    return message;
  }
  catch(e) {
    var stats = {received: result.stdout};
    var words = result.stderr.split(' ');
    words.forEach((w) => {
      var parts = w.split('=');
      if (parts.length === 2) {
        stats[parts[0]] = parts[1];
      }
    })

    throw new Error(e.message + ' ' + JSON.stringify(stats));
  }
};
