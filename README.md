# Imageo
Use an image as the map for navigation.

## Concept
Load an image, mark several points on the image with the current device position. With 2 of such points, it will be able to show the current position on the image. In the future version, with more than 2 points, the accuracy of the current position displaying will be increased.

## Ideas & Caveats & Bugs

### Algorithm Related
* Currently the image must have the north direction pointing upwards.
* Only the first 2 points added are taken into account for the geo-image transformation.
* If the 2 points have similar x value or y value on the image, the geo-image transformation algorithm will be not accuracy in the x- or y-axis.
* Geo-image transformation will be broken near the poles.

### New Features
* Users should be able to manually select a point on the image and assign its geographic coordinate.

### UX Related
* Notify user when tab is going to be closed.
* Notify user when pin is going to be removed.
* Double tip to zoom.
* After scaled the image with 2 fingers, then release 1 finger, at that moment, user cannot translate image with the 1 finger still on the screen.
* Store added points, so that the users don't need browser running all the time.

### Usability Related
* Safari on iOS is not supported. Android WebView is not tested. But we should do so because later on we may use cordova to build an App.

## Glossary for Myself
* __file__: the image file to be used as a map;
* __image__: the loaded image (or the object representing its dimension) to be used as a map;
* __image transformation__: translating and scaling of the image according to user interactions;
* __geo-image transformation__: the transformation between geographic coordinate system and image coordinate system;
* __navigation__: the concept including using an image as a map, retrieving current position, calculate geo-image transformation, and displaying the current position;

## Local Development

```console
$ npm install
$ sudo npm install -g http-server
$ npm run build
$ http-server dist
```
