var chokidar = require('chokidar');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

// setup webserver port
var port = process.env.PORT || 3000;
server.listen(port);

var imageFolder = argv._[0];
var imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// serve modern-normalize
app.use('/modern-normalize', express.static(__dirname + '/node_modules/modern-normalize/'));
// serve static files
app.use(express.static(__dirname + '/public'));
// serve image folder
app.use('/images', express.static(imageFolder));


// return index.html when requesting /
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/index.html');
});


var allImages = [];

// init file watcher
var watcher = chokidar.watch(imageFolder, {
    ignored: /[\/\\]\./,
    depth: argv.recursive ? undefined : 0,
    persistent: true
});

// init websocket
io.on('connection', function (client) {
    console.log('new client connected (total: ' + io.engine.clientsCount + ')');

    // send all currently available images
    client.emit('allImages', allImages);
});

// notify clients when a new image is added
watcher.on('add', function (filePath) {
    if (imageExtensions.indexOf(path.extname(filePath).toLowerCase()) === -1) {
        return;
    }

    var relativeFilePath = path.relative(imageFolder, filePath);
    console.log('found new file: ' + relativeFilePath);

    fs.stat(filePath, function (err, stats) {
        var image = {
            src: 'images/' + relativeFilePath,
            date: stats.mtime,
            lastShown: 0
        };
        io.emit('newImage', image);

        allImages.push(image);
    });
});


// now it's all up and running...
console.log('App running under http://' + require('os').hostname() + ':' + port + '/');