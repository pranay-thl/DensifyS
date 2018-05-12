
const WebSocket = require('ws');

const express = require('express');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const http = require('http');
var app = express();
var densifydb;
//connect to the database
mongoClient.connect('mongodb://localhost:27017', function(err, client) {
	if(err) throw err;
	densifydb = client.db('densifydb');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/', function (req, res) {
	res.sendFile( __dirname + "/" + "index.html" );
})

app.post('/insertAdvert', function(req, res) {
	console.log("inserting advert at: "+req.body.latitude+" "+req.body.longitude);
	densifydb.collection('advert').insertOne({
		latitude : req.body.latitude,
		longitude : req.body.longitude,
		advertData : req.body.advertData
	},(err,result)=>{
		if(err)
		{
			res.send("Insert Failed");
		}
		res.send("Inserted :"+JSON.stringify(result))});
});

var dataMap = {};
var resultMap = {};
function noop() {};

function heartbeat() {
  this.isAlive = true;
}
setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false){
			return ws.terminate();
		}
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 3000);

function nearby_clients(dist,id){
	var res_arr=[];
	var thisDevLat = dataMap[id].latitude;
	var thisDevLon = dataMap[id].longitude;	
	for(var deviceId in dataMap) {
		if(deviceId !== id) {
			var dis = getDistanceFromLatLonInKm(thisDevLat,
				thisDevLon, dataMap[deviceId].latitude, dataMap[deviceId].longitude);
			if(dis<=dist){
				res_arr.push({id:deviceId,dist:dis});
			}
		}
	}
	return res_arr;
}

function send_nearby(dist,id,ws){
	var res_data={"clients":[]};
	res_data["clients"]=nearby_clients(dist,id);
	ws.send(JSON.stringify(res_data));
}

function send_advertisements(dist,id,ws)
{
	densifydb.collection('advert').find().toArray(function(err, advertArray) {
		var thisDevLat = dataMap[id].latitude;
		var thisDevLon = dataMap[id].longitude;	
		for(var i=0;i<advertArray.length;i++) {
			console.log(thisDevLat+" "+thisDevLon+" "+advertArray[i].latitude+" "+advertArray[i].longitude);
			var dis = getDistanceFromLatLonInKm(thisDevLat,
				thisDevLon, advertArray[i].latitude, advertArray[i].longitude);
			console.log("dist is "+dis);
			if(dis<=dist){
				ws.send(JSON.stringify({advert:advertArray[i].advertData}));
			}
		}
	});
}
wss.on('connection', function connection(ws,req) {
	ws.isAlive = true;
  ws.on('pong', heartbeat);
	var ip = req.connection.remoteAddress;
	ws.on('message', function(data) {
		console.log('received : %s', data);
		//ws.send('Ack for data: '+data);
		var deviceData = JSON.parse(data);
		dataMap[deviceData.deviceId]=deviceData;
		//compute(deviceData.deviceId);
		send_nearby(2,deviceData.deviceId,ws);
		send_advertisements(2,deviceData.deviceId,ws);
	});
	//ws.send("You are connected. Current Client Size is: "+wss.clients.size);
	console.log("IP Connnected:"+ip+"\n"+" Now Total Clients are: "+wss.clients.size);
});

function compute(thisDeviceId) {
	var thisDevLat = dataMap[thisDeviceId].latitude;
	var thisDevLon = dataMap[thisDeviceId].longitude;

	var result = {};

	for(var deviceId in dataMap) {
		//console.log("deviceId: " + deviceId + " thisDeviceId: " + thisDeviceId);
		if(deviceId !== thisDeviceId) {
			var dist = getDistanceFromLatLonInKm(thisDevLat,
				thisDevLon, dataMap[deviceId].latitude, dataMap[deviceId].longitude);
			result[deviceId]=dist;
		}
	}
	resultMap[thisDeviceId]=result;
	console.log("ResultMap is: "+JSON.stringify(resultMap));
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

server.listen(8000, function listening() {
  console.log('Listening on %d', server.address().port);
});