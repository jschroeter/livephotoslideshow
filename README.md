# livephotoslideshow
Simplistic node.js app which shows images in a specified folder as a slideshow - with the special feature of instantly showing added files on all clients since they get notified via WebSocket connection. Useful e.g. for setting up a live photo wall of a photo booth.

## Usage
`npm install`

`node server.js /path/to/images`

or

`node server.js /path/to/images --recursive`