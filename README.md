# acoustic-wifi-setup
Get an IoT device (with microphone) online by transmitting wifi
network and password acoustically from a web app. See a demo on youtube: 
https://www.youtube.com/watch?v=EegFAwh7Kmk

## Setup

- install minimodem on the receiver device with a command like:

```
$ sudo apt-get install minimodem
```

- clone this repo onto that device, and run the index.js file with
  node (Note that at this point, the node program does not actually do
  any wifi setup. It just receives a message and prints it to prove
  that the information can be transmitted acoustically.)

```
$ git clone git@github.com:davidflanagan/acoustic-wifi-setup.git
$ cd acoustic-wifi-setup
$ node index.js
```

- Visit https://davidflanagan.github.io/acoustic-wifi-setup/ in a web
  browser running on the transmitting device. Enter a wifi network
  name and password (or any strings you want to transmit), then click
  Transmit, and then hold the speaker of your phone up to the
  microphone on the receiving device. Don't talk or move the
  transmitter during the transmission. The default shared/config.js
  makes this transmit at 150baud. (That's 15 bytes per second. And
  there is a 20 byte overhead. So a 25 byte message would result in a
  3 second audio transmission.)

- If all goes well, the receiver will print the transmitted text. Or
  it will print an error. If it doesn't do either, turn up the volume
  and try transmitting again.

- If you want to try different modem parameters, edit shared/config.js
  on the receiving device. Then clone this repo to a web server, make
  the same config.js edits and load the customized transmitter from
  that server. If you use an audio cable instead of a microphone and
  speaker, for example, you should be able to get much higher data
  rates.
