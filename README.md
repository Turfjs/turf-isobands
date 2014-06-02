turf-isobands
=============
[![Build Status](https://travis-ci.org/Turfjs/turf-isobands.svg?branch=master)](https://travis-ci.org/Turfjs/turf-isobands)

Takes a FeatureCollection of points with z values and an array of value breaks and generates filled contour isobands. These are commonly used to create elevation maps, but can be used for general data interpolation as well.

```js
var isobands = require('turf-isobands')
var fs = require('fs')

var z = 'elevation'
var resolution = 15
var breaks = [.1, 22, 45, 55, 65, 85,  95, 105, 120, 180]
var points = JSON.parse(fs.readFileSync('/path/to/points.geojson'))

isobands(points, z, resolution, breaks)

console.log(isolines)
```