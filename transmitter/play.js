function play(samples, samplesPerSecond) {
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  var context = new AudioContext();
  buffer = context.createBuffer(1, samples.length, samplesPerSecond);
  buffer.getChannelData(0).set(samples, 0);
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
}
