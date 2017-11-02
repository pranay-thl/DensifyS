
const WebSocket = require('ws');
const wss =  new WebSocket.Server({ port: 8000 });

wss.on('connection', function connection(ws,req) {
	// var deviceId;
	// var result;
	const ip = req.connection.remoteAddress;
	ws.on('message', function(data) {
		// deviceId = JSON.parse(data).deviceId;
		console.log('received : %s', data);
		ws.send('Ack for data: '+data);
		// result = computeReccomendations(data);
	});
	// extract result specific to the deviceId and send through ws
	ws.send("You are connected. Current Client Size is: "+wss.clients.size);
	console.log("IP Connnected:"+ip+"\n"+" Now Total Clients are: "+wss.clients.size);
});
