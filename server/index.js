var express = require('express'),
	mongoose = require('mongoose'),
	http = require('http'),
	secrets = require('./config/secrets');

var app = express(),
	server = http.Server(app);

// Find the appropriate database to connect to, default to localhost if not found.
function connect() {
	mongoose.connect(secrets.db, function(err, res) {
		if (err) {
			console.log('Error connecting to: ' + secrets.db + '. ' + err);
		} else {
			console.log('Succeeded connected to: ' + secrets.db);
		}
	});
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap application settings
require('./config/express')(app);
// Bootstrap routes
require('./config/routes')(app);

server.listen(app.get('port'), function() {
	if (process.send) {
		process.send('online');
	} else {
		console.log('The server is running at http://localhost:' + app.get('port'));
	}
});