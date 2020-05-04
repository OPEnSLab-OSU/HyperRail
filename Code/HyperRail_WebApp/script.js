//alert('hello');
const SerialPort = require('serialport');
var WebSocketServer = require('ws').Server; 

const Readline = require('@serialport/parser-readline');
const port = new SerialPort('COM15', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));


var SERVER_PORT = 8081;
var wss = new WebSocketServer({port: SERVER_PORT}); 
var connections = new Array; 

wss.on('connection', handleConnection);
 
function handleConnection(client) {
 console.log("New Connection"); // you have a new client
 connections.push(client); // add this client to the connections array
 
 client.on('message', sendToSerial); // when a client sends a message,
 
 client.on('close', function() { // when a client closes its connection
 console.log("connection closed"); // print it out
 var position = connections.indexOf(client); // get the client's position in the array
 connections.splice(position, 1); // and delete it from the array
 });
}

port.on("open", () => {
    console.log('serial port open');
}); 

// parser.on('data', data => {
//     console.log('got word from arduino: ', data);
// });


function sendJSON()
{
    // var json = new Object(); 

    // json.put("X_Location", x);
    // json.put("Y_Location", y);
    // json.put("Z_Location", z);
    // json.put("Velocity", vel);
    // json.put("SpoolRadX", radX);
    // json.put("SpoolRadYZ", radY); 

    var x = document.getElementById("X").value
    var y = document.getElementById("Y").value
    var z = document.getElementById("Z").value
    var vel = document.getElementById("vel").value
    var radX = document.getElementById("radX").value
    var radYZ = document.getElementById("radY").value

    alert(x);

    var json = 
    {
        "X_Location": x,
        "Y_Location": y,
        "Z_Location": z,
        "Velocity": vel,
        "SpoolRadX": radX,
        "SpoolRadYZ": radYZ
    };

    var message = JSON.stringify(json); 
    
    port.write(message
        , (err) => {
        if(err) {
           alert('Error on write: ', err.message);
        }
        console.log('message written');
        alert('AAA');
    })
}

function demo()
{
    return 70; 
}

function popup()
{
    alert('AAAAAA');
}



var json = 
{
    "X_Location": 1200,
    "Y_Location": 0,
    "Z_Location": 0,
    "Velocity": 2500,
    "SpoolRadX": 32,
    "SpoolRadYZ": 32
};



var message = JSON.stringify(json); 

port.write(message
    , (err) => {
    if(err) {
       alert('Error on write: ', err.message);
    }
    console.log('message written');
    alert('AAA');
})