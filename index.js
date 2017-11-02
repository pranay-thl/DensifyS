
const WebSocket = require('ws');
const wss =  new WebSocket.Server({ port: 8000 });

var dataMap = new Map();
var resultMap = new Map();

wss.on('connection', function connection(ws) {
	ws.on('message', function(data) {
		console.log('received : %s', data);
		var deviceData = JSON.parse(data);

		dataMap.set(deviceData.deviceId, deviceData);		// refresh data for every new entry of this device
		compute(deviceData.deviceId);
	});

	// setTimeout(() => { ws.send(resultMap.get(deviceData.deviceId)); }, 10000);
});

function compute(thisDeviceId) {
	var thisDevLat = dataMap.get(deviceId).latitude;
	var thisDevLon = dataMap.get(deviceId).longitude;

	var result = '';

	for(var [deviceId, deviceData] of dataMap) {
		console.log("deviceId: " + deviceId + " thisDeviceId: " + thisDeviceId);
		if(deviceId !== thisDeviceId && deviceId !== undefined) {
			var dist = getDistanceFromLatLonInKm(thisDevLat,
				thisDevLon, deviceData.latitude, deviceData.longitude);
			result += 'device: ' + deviceId + ' distance: ' + dist;
		}
	}
	console.log("result: " + result);
	resultMap.set(thisDeviceId, result);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}