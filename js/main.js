// Load the http module to create an http server.
/*
import './index.css';

var http = require('http');
var fs = require('fs');

function onRequest(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	fs.readFile('./index.html', null, function(error, data) {
		if (error) {
			response.writeHead(404);
			response.write('file not found');
		} else {
			response.write(data);
		}
		response.end();
	});
}
http.createServer(onRequest).listen(8000);
*/



const io = require('socket.io')(http); 
const Gpio = require('pigpio').Gpio; 

console.log('gate1!');
console.log(button);
//const button = new Gpio(18, {mode: Gpio.INPUT});
const button = new Gpio(18, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_UP, //set button to low
	alert: true
});
 

if (button === 1) {
	document.getElementById('simulateClick').click();
	console.log('clicked!');
} else {
console.log('not clicked!');
}




/*
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(17, 'out'); //use GPIO pin 4 as output
var pushButton = new Gpio(27, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, $
//var clickMicButton = document.getElementById('labnol');

 
// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) 
{
	pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify$
		if (err) { //if an error
		  console.error('There was an error', err); //output error message to console
		return;
		}
		LED.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
		//clickMicButton.writeSync(value)();
		startDictation();
	  });
});
 
// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);
 
// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");




function unexportOnClose() { //function to run when exiting program
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user 
*/