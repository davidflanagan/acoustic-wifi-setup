//
// This afsk() function returns a function that does audio frequency-shift 
// keying, modulating an ASCII input string into a Float32Array of audio
// samples suitable for playing with the WebAudio API.
//
// The returned modulator function works similarly to a Bell 202 acoustic
// modem, using 8-N-1 encoding, which means that each byte is encoded
// as 10 bits: a start bit, 8 data bits, no parity bit and a stop bit.
//
// afsk() takes an objec that contains  modem configuration options.
// See shared/config.js for the default values.
//
// The modulation function is designed to produce audio that can be
// demodulated using minimodem: https://github.com/kamalmostafa/minimodem
// The following command line works to demodulate audio modulated with
// the defaults listed above:
//
// $ minimodem -r 300 --rx-one -M 4500 -S 3000 --sync-byte=0xAA
//
// See:
// https://en.wikipedia.org/wiki/Frequency-shift_keying
// https://en.wikipedia.org/wiki/Bell_202_modem
// https://en.wikipedia.org/wiki/Asynchronous_serial_communication
//
function afsk(options) {
  'use strict';

  var carrierPrefixLength = options.carrierPrefixLength || 0;
  var syncByte = options.syncByte || null;

  var samplesPerBit = options.samplesPerSecond / options.bitsPerSecond;
  if (samplesPerBit !== Math.round(samplesPerBit)) {
    throw new Error('samplesPerSecond must be an integer multiple' +
                    ' of bitsPerSecond');
  }

  // Modulate a string of ASCII text into a Float32Array suitable for use
  // with the WebAudio API
  return function modulate(text) {
    var numBits = text.length * 10; // Including start and stop bits for each
    numBits += carrierPrefixLength; // Add prefix bits
    if (syncByte) numBits += 10;    // Add syncronization byte
    var samples = new Float32Array(numBits  * samplesPerBit);

    // State used when outputting the samples
    var sampleIndex = 0;
    var phase = 0.0;

    function mark() {
      modulateBit(options.markFrequency);
    }

    function space() {
      modulateBit(options.spaceFrequency);
    }

    function modulateBit(frequency) {
      var samplesPerCycle = options.samplesPerSecond / frequency;
      var phaseChangePerSample = 2 * Math.PI / samplesPerCycle;
      for(var i = 0; i < samplesPerBit; i++) {
        samples[sampleIndex] = Math.sin(phase);
        sampleIndex++;
        phase += phaseChangePerSample;
      }
    }

    // This is how we output a the audio samples for a single byte
    function modulateByte(byte) {
      // First, mark the start of the byte with a start bit
      space();

      // Then output the 8 data bits of the byte starting with the LSB
      for(var bit = 0; bit < 8; bit++) {
        var b = byte % 2;
        byte = byte >> 1;
        if (b === 1) {
          mark();
        }
        else {
          space();
        }
      }

      // And output the stop bit.
      mark();
    }

    // Start off with a carrier signal prefix. This is a repeated
    // stop bit. The message starts when it switch to the start bit.
    for(var i = 0; i < carrierPrefixLength; i++)
      mark();

    // If a sync byte was specified, modulate that first
    if (syncByte !== null) {
      modulateByte(syncByte);
    }

    // Fill the audio buffer with audio samples for each of the characters
    for(var i = 0; i < text.length; i++) {
      modulateByte(text.charCodeAt(i) & 0xFF);
    }

    return samples;
  }
}
