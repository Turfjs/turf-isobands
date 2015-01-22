# turf-isobands

[![build status](https://secure.travis-ci.org/Turfjs/turf-isobands.png)](http://travis-ci.org/Turfjs/turf-isobands)

turf isobands module


### `turf.isobands(points, z, resolution, breaks)`

Takes a FeatureCollection of points with z values and an array of
value breaks and generates filled contour isobands. These are commonly
used to create elevation maps, but can be used for general data
interpolation as well.


### Parameters

| parameter    | type              | description                                          |
| ------------ | ----------------- | ---------------------------------------------------- |
| `points`     | FeatureCollection |                                                      |
| `z`          | string            | - a property name from which z values will be pulled |
| `resolution` | number            | - resolution of the underlying grid                  |
| `breaks`     | Array.<number>    | - where to draw contours                             |


### Example

```js
// create random points with random
// z-values in their properties
var points = turf.random('point', 100, {
  bbox: [0, 30, 20, 50]
});
for (var i = 0; i < points.features.length; i++) {
  points.features[i].properties.z = Math.random() * 10;
}
var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var isolined = turf.isobands(points, 'z', 15, breaks);
//=isolined
```


**Returns** `FeatureCollection`, isolines

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install turf-isobands
```

## Tests

```sh
$ npm test
```

