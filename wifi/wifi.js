var run = require('./run.js');
var platform = require('./platform.js');

exports.getStatus = getStatus;
exports.waitForWifi = waitForWifi;
exports.getConnectedNetwork = getConnectedNetwork;
exports.scan = scan;
exports.defineNetwork = defineNetwork;
exports.getKnownNetworks = getKnownNetworks;

/*
 * Determine whether we have a wifi connection with the `wpa_cli
 * status` command. This function returns a Promise that resolves to a
 * string.  On my Rasberry Pi, the string is "DISCONNECTED" or
 * "INACTIVE" when there is no connection and is "COMPLETED" when
 * there is a connection. There are other possible string values when
 * a connection is being established
 */
function getStatus() {
  return run(platform.getStatus);
}

// Return a promise, then check every interval ms for a wifi connection.
// Resolve the promise when we're connected. Or, if we aren't connected
// after maxAttempts attempts, then reject the promise
function waitForWifi(maxAttempts, interval) {
  return new Promise(function(resolve, reject) {
    var attempts = 0;
    check();

    function check() {
      attempts++;
      console.log('check', attempts);
      getStatus()
        .then(status => {
          console.log(status);
          if (status === 'COMPLETED') {
            console.log('Wifi connection found');
            resolve();
          }
          else {
            console.log('No wifi connection on attempt', attempts);
            retryOrGiveUp()
          }
        })
        .catch(err => {
          console.error('Error checking wifi on attempt', attempts, ':', err);
          retryOrGiveUp();
        });
    }

    function retryOrGiveUp() {
      if (attempts >= maxAttempts) {
        console.error('Giving up. No wifi available.');
        reject();
      }
      else {
        setTimeout(check, interval);
      }
    }
  });
}

/*
 * Determine the ssid of the wifi network we are connected to.
 * This function returns a Promise that resolves to a string. 
 * The string will be empty if not connected.
 */
function getConnectedNetwork() {
  return run(platform.getConnectedNetwork);
}

/*
 * Scan for available wifi networks using `iwlist wlan0 scan`.
 * Returns a Promise that resolves to an array of strings. Each string
 * is the ssid of a wifi network. They are sorted by signal strength from
 * strongest to weakest. On a Raspberry Pi, a scan seems to require root
 * privileges.
 *
 * On a Raspberry Pi 3, this function works when the device is in AP mode.
 * The Intel Edison, however, cannot scan while in AP mode: iwlist fails
 * with an error. iwlist sometimes also fails with an error when the
 * hardware is busy, so this function will try multiple times if you
 * pass a number. If all attempts fail, the promise is resolved to
 * an empty array.
 */
function scan(numAttempts) {
  numAttempts = numAttempts || 1;
  return new Promise(function(resolve, reject) {
    var attempts = 0;

    function tryScan() {
      attempts++;

      _scan()
        .then(out => { resolve(out.length ? out.split('\n') : []);})
        .catch(err => {
          console.error('Scan attempt', attempts, 'failed:', err.message||err);

          if (attempts >= numAttempts) {
            console.error('Giving up. No scan results available.');
            resolve([]);
            return;
          }
          else {
            console.error('Will try again in 3 seconds.');
            setTimeout(tryScan, 3000);
          }
        });
    }

    tryScan();
  });

  function _scan() {
    return run(platform.scan)
  }
}

/*
 * This function uses wpa_cli to add the specified network ssid and password
 * to the wpa_supplicant.conf file. This assumes that wpa_supplicant is
 * configured to run automatically at boot time and is configured to work
 * with wpa_cli.
 *
 * If the system is not connected to a wifi network, calling this
 * command with a valid ssid and password should cause it to connect.
 */
function defineNetwork(ssid, password) {
  return run(password ? platform.defineNetwork : platform.defineOpenNetwork, {
    SSID: ssid,
    PSK: password
  });
}

/*
 * Return a Promise that resolves to an array of known wifi network names
 */
function getKnownNetworks() {
  return run(platform.getKnownNetworks)
    .then(out => out.length ? out.split('\n') : []);
}
