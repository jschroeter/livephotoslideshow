(function () {
    var slideShowSpeed = 10 * 1000;

    var allImages = [];
    var slideShowEl = document.getElementById('slideShow');

    var getNextImage = function () {
        // sort all images by showCount and date, so images which were shown less often will get priority
        allImages.sort(function(a, b) {
            if (a.showCount === b.showCount) {
                return new Date(a.date) - new Date(b.date);
            } else {
                return a.showCount - b.showCount;
            }
        });

        var nextImage = allImages[0];
        nextImage.showCount++;

        return nextImage;
    };

    var insertImage = function () {
        var image = getNextImage();
        var listEl = document.createElement('li');
        var imageEl = document.createElement('img');
        imageEl.setAttribute('src', image.src);

        imageEl.addEventListener('load', function () {
            // make image visible after it's loaded
            listEl.classList.add('fx');

            // apply random transform origin, just for some variation
            listEl.classList.add(['fx-bl', 'fx-tr', 'fx-tl', 'fx-br'][Math.floor(Math.random() * 4)]);

            // remove invisible images to reduce memory usage
            if (slideShowEl.childElementCount > 2) {
                if (!slideShowEl.children[0].classList.contains('fx')) {
                    slideShowEl.removeChild(slideShowEl.children[0]);
                }

                slideShowEl.children[0].classList.remove('fx');
            }

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