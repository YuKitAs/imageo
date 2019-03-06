# Imageo
Use an image as the map for navigation.

## Concept
Load an image, mark several points with the current device position (or with known geographic coordinate in the coming version). With more than 2 such points, it will be able to show the current position on the image. With more than 2 points, it will increase the accuracy of the current position displaying.

## Glossary for Myself
* __file__: the image file to be used as a map;
* __image__: the loaded image (or the object representing its dimension) to be used as a map;
* __image transformation__: translating and scaling of the image according to user interactions;
* __geo-image transformation__: the transformation between geographic coordinate system and image coordinate system;
* __navigation__: the concept including using an image as a map, retrieving current position, calculate geo-image transformation, and displaying the current position;
