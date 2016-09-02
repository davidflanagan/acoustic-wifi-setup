(function(global) {
  var modemOptions = {
    // This is how many samples per second the modulator will produce.
    samplesPerSecond: 48000,
    // The baud rate: how many bits per second we transmit.
    // Note that not all of these are data bits. We send 10 bits per byte
    // plus some overhead
    bitsPerSecond: 75,
    // The frequency in Hz that indicates a 1 bit. This frequency and the next
    // are substantially higher than the old Bell 202 acoustic modem default.
    // Higher values seem to be more robust against environmental noise.
    // But microphones don't respond well at even higher values, so don't
    // go too high
    markFrequency: 4500,
    // The frequency in Hz that indicates a 0 bit
    spaceFrequency: 3000,
    // How many end bits we send at the start of a transmission
    carrierPrefixLength: 80,
    // A special synchronization value we send before any data bytes.
    // Set this to null if you don't want a sync byte
    syncByte: 0xAA,
    // Set this to true if you're running the receiver code on a Linux system
    // that does not have PulseAudio installed. (It adds -A to the minimodem
    // commandline).
    requiresDashA: true,

    // If you're testing the receiver code on a computer that does not
    // support Linux-style GPIO, set these properties to null. 
    // Otherwise set them to the appropriate GPIO pin
    redGPIO: 25,
    blueGPIO: 23,
    greenGPIO: 24
  }

  if (global.window) {
    window.modemOptions = modemOptions;
  }
  else {
    module.exports = modemOptions;
  }
}(this));
