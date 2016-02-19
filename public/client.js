$(document).ready(function () {

    // init WebSocket
    var socket = io.connect();

    // new image
    socket.on('newImage', function (data) {
        var date = new Date(data.timestamp);

        $('#images').prepend(
            $('<li></li>').append(
                $('<img>').attr('src', data.src)),

            // time
            $('<span>').text('[' +
                (date.getHours() < 10 ? '0' + date.getHours() : date.getHours())
                + ':' +
                (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                + '] '
            )
        );

    });

});