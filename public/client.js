(function () {
    var slideShowSpeed = 10 * 1000;

    var allImages = [];
    var slideShowEl = document.getElementById('slideShow');

    var getNextImage = function () {
        // sort all images by modification date and last shown date, so new images will get priority
        allImages.sort(function(a, b) {
            if (a.lastShown === b.lastShown) {
                return new Date(a.date) - new Date(b.date);
            } else {
                return a.lastShown - b.lastShown;
            }
        });

        var nextImage = allImages[0];
        nextImage.lastShown = Date.now();

        return nextImage;
    };

    var insertImage = function () {
        var image = getNextImage();
        var listEl = document.createElement('li');
        var imageEl = document.createElement('img');
        imageEl.setAttribute('src', image.src);

        // apply random transform origin, just for some variation
        listEl.classList.add(['fx-bl', 'fx-tr', 'fx-tl', 'fx-br'][Math.floor(Math.random() * 4)]);

        imageEl.addEventListener('load', function () {
            // make image visible after it's loaded; little timeout needed to trigger the transition when image is in cache
            window.setTimeout(function () {
                listEl.classList.add('fx');
            }, 50);

            // remove invisible (after opacity transition ended) images to reduce memory usage
            window.setTimeout(function () {
                if (slideShowEl.childElementCount >= 2) {
                    slideShowEl.removeChild(slideShowEl.children[0]);
                }
            }, 3500);
        });

        listEl.appendChild(imageEl);
        slideShowEl.appendChild(listEl);
    };

    var startSlideShow = function () {
        insertImage();
        window.setInterval(insertImage, slideShowSpeed);
    };



    // init WebSocket
    var socket = io.connect();

    socket.on('allImages', function (data) {
        allImages = data;

        startSlideShow();
    });

    socket.on('newImage', function (data) {
        allImages.push(data);
    });

})();