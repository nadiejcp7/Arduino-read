const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

var port = null;

SerialPort.list().then((ports) => {
    if (ports.length > 0) {
        const portPath = ports[0].path;  // Use the first available port
        console.log('Using port:', portPath);

        // Create a new SerialPort instance
        port = new SerialPort({
            path: portPath,
            baudRate: 9600
        });

        // Create a parser instance and pipe the serial port to it
        const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

        port.on('open', () => {
            console.log('Serial port opened on:', portPath);
            sendInitialData();
        });

        // Listen for data coming from the Arduino
        parser.on('data', (data) => {
            console.log('Data from Arduino:', data);
        });

        // Handle errors
        port.on('error', (err) => {
            console.error('Serial port error:', err.message);
        });

        parser.on('error', (err) => {
            console.error('Parser error:', err.message);
        });
    } else {
        console.error('No ports found');
    }
}).catch((err) => console.error('Error listing ports:', err));

function sendToArduino(data) {
    port.write(data + '\n', (err) => {
        if (err) {
            return console.error('Error on write:', err.message);
        }
    });
}

server.on('connection', socket => {

    socket.on('message', message => {
        sendToArduino(message);
        socket.send(`Echo: received`);
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const sendInitialData = async () => {
    await sleep(2000);
    const d = new Date();
    const msg = 't ' + d.getHours().toString().padStart(2, "0") +
        d.getMinutes().toString().padStart(2, "0") + d.getSeconds().toString().padStart(2, "0");
    sendToArduino(msg);
}