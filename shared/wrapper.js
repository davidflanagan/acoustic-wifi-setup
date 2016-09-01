(function(global) {
  "use strict"

  var wrapper = {
    wrap: wrap,
    unwrap: unwrap
  }

  if (global.window) {
    window.wrapper = wrapper;
  }
  else {
    module.exports = wrapper;
  }

  // Add 8 hexadecimal digits and a newline to the beginning of
  // the string s, and return the resulting string. The first four
  // hexadecimal digits encode the length of s. The second four
  // hex digits are the Fletcher-16 checksum of s
  function wrap(s) {
    return toHexDigits(s.length, 4) +
      toHexDigits(fletcher16(s), 4) +
      '\n' +
      s;
  }

  // Unwrap a string wrapped with the wrap() function, verify the format
  // length and checksum and return the original string or throw an error
  function unwrap(s) {
    if (s.charAt(8) !== '\n') {
      throw new Error('wrapper format error');
    }

    var length = Number('0x' + s.substring(0,4));
    var checksum = Number('0x' + s.substring(4,8));
    var data = s.substring(9);

    if (data.length !== length) {
      throw new Error('data length error')
    }

    if (fletcher16(data) !== checksum) {
      throw new Error('checksum error');
    }

    return data;
  }

  // Convert the number n to a hex string pad on the left with 0s as needed
  // so that the returned string is always width characters wide
  function toHexDigits(n, width) {
    var s = n.toString(16);
    while(s.length < width) {
      s = "0" + s;
    }
    return s;
  }

  // Compute a Fletcher-16 checksum of the specified string, using only
  // the low 8 bits of each codepoint
  // See https://en.wikipedia.org/wiki/Fletcher%27s_checksum
  function fletcher16(s) {
    var a = 0, b = 0;
    for(var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i) & 0xFF;
      a = (a + c) % 255;
      b = (b + a) % 255;
    }
    return b << 8 | a;
  }

}(this));
