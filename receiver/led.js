var fs = require('fs');

module.exports = LED;

function LED(redPin, greenPin, bluePin, useTTY) {
  this.redPin = redPin;
  this.greenPin = greenPin;
  this.bluePin = bluePin;
  this.redFD = this.configurePin(this.redPin);
  this.greenFD = this.configurePin(this.greenPin);
  this.blueFD = this.configurePin(this.bluePin);

  if (useTTY) {
    this.tty = fs.createWriteStream('/dev/tty');
  }
}

LED.prototype.release = function() {
  this.releasePin(this.redPin, this.redFD);
  this.releasePin(this.greenPin, this.greenFD);
  this.releasePin(this.bluePin, this.blueFD);
};

LED.prototype.configurePin = function(n) {
  try {
    fs.writeFileSync('/sys/class/gpio/export', n.toString());
  }
  catch(e) {
    // If the pin is already exported, the line will cause an error
    // which we can just ignore
  }
  fs.writeFileSync('/sys/class/gpio/gpio' + n + '/direction', 'out');
  return fs.openSync('/sys/class/gpio/gpio' + n + '/value', 'w');
};

LED.prototype.releasePin = function(n, fd) {
  fs.writeFileSync('/sys/class/gpio/unexport', n.toString());
  fs.closeSync(fd);
};

LED.prototype.off = function() {
  fs.writeSync(this.redFD, "0", 0, 1);
  fs.writeSync(this.greenFD, "0", 0, 1);
  fs.writeSync(this.blueFD, "0", 0, 1);
  if (this.tty) {
    this.tty.write('\x0d  ');
  }
}

LED.prototype.red = function() {
  fs.writeSync(this.redFD, "1", 0, 1);
  fs.writeSync(this.greenFD, "0", 0, 1);
  fs.writeSync(this.blueFD, "0", 0, 1);
  if (this.tty) {
    this.tty.write('\x0d\x1b[41m  \x1b[0m');
  }
}

LED.prototype.green = function(on) {
  fs.writeSync(this.redFD, "0", 0, 1);
  fs.writeSync(this.greenFD, "1", 0, 1);
  fs.writeSync(this.blueFD, "0", 0, 1);
  if (this.tty) {
    this.tty.write('\x0d\x1b[42m  \x1b[0m');
  }
}

LED.prototype.blue = function(on) {
  fs.writeSync(this.redFD, "0", 0, 1);
  fs.writeSync(this.greenFD, "0", 0, 1);
  fs.writeSync(this.blueFD, "1", 0, 1);
  if (this.tty) {
    this.tty.write('\x0d\x1b[44m  \x1b[0m');
  }
}

