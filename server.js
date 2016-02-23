var chokidar = require('chokidar');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var fs = require('fs');

// setup webserver port
var port = process.env.PORT || 3000;
server.listen(port);

var imageFolder = process.argv[2];
var imageExtentions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

// serve jquery and normalize.css
app.use('/normalize.css', express.static(__dirname + '/node_modules/normalize.css/'));
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
    persistent: true
});

// init websocket
io.sockets.on('connection', function (socket) {
    console.log('new client connected (total: ' + io.engine.clientsCount + ')');

    // send all currently available images
    socket.emit('allImages', allImages);
});

// notify clients when a new image is added
watcher.on('add', function (filePath) {
    if (imageExtentions.indexOf(path.extname(filePath).toLowerCase()) === -1) {
        return;
    }

    var relativeFilePath = path.relative(imageFolder, filePath);
    console.log('found new file: ' + relativeFilePath);

    var image = {
        src: 'images/' + relativeFilePath,
        date: fs.statSync(filePath).mtime,
        showCount: 0
    };
    io.sockets.emit('newImage', image);

    allImages.push(image);
});


// now it's all up and running...
console.log('App running under http://' + require('os').hostname() + ':' + port + '/');