const WebSocket = require('ws');
 
const ws1 = new WebSocket('ws://127.0.0.1:8000');
const ws2 = new WebSocket('ws://127.0.0.1:8000');
const ws3 = new WebSocket('ws://127.0.0.1:8000');
var data1={deviceId:'1',latitude:13.105832,longitude:77.567981};
var data2={deviceId:'2',latitude:13.107396,longitude:77.577122};
var data3={deviceId:'3',latitude:13.065187,longitude:77.583461};
ws1.on('open', function open() {
  ws1.send(JSON.stringify(data1));
});
ws2.on('open', function open() {
    ws2.send(JSON.stringify(data2));
});
ws3.on('open', function open() {
    ws3.send(JSON.stringify(data3));
}); 
ws1.on('message', function incoming(data) {
  console.log("client 1: "+data);
});
ws2.on('message', function incoming(data) {
    console.log("client 2: "+data);
});
ws3.on('message', function incoming(data) {
    console.log("client 3: "+data);
});