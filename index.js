//https://github.com/jasondavies/conrec.js
//http://stackoverflow.com/questions/263305/drawing-a-topographical-map
var tin = require('turf-tin');
var inside = require('turf-inside');
var grid = require('turf-grid');
var extent = require('turf-extent');
var planepoint = require('turf-planepoint');
var featurecollection = require('turf-featurecollection');
var linestring = require('turf-linestring');
var polygon = require('turf-polygon');
var point = require('turf-point');
var square = require('turf-square');
var size = require('turf-size');
var Conrec = require('./conrec.js');

/**
 * Takes a {@link FeatureCollection} of {@link Point} features with z-values and an array of
 * value breaks and generates filled contour isobands.
 *
 * @module turf/isobands
 * @category interpolation
 * @param {FeatureCollection} points a FeeatureCollection of {@link Point} features
 * @param {string} z the property name in `points` from which z-values will be pulled
 * @param {number} resolution resolution of the underlying grid
 * @param {Array<number>} breaks where to draw contours
 * @returns {FeatureCollection} a FeatureCollection of {@link Polygon} features representing isobands
 * @example
 * // create random points with random
 * // z-values in their properties
 * var points = turf.random('point', 100, {
 *   bbox: [0, 30, 20, 50]
 * });
 * for (var i = 0; i < points.features.length; i++) {
 *   points.features[i].properties.z = Math.random() * 10;
 * }
 * var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * var isolined = turf.isobands(points, 'z', 15, breaks);
 * //=isolined
 */
module.exports = function(points, z, resolution, breaks){
  var addEdgesResult = addEdges(points, z, resolution);

  var tinResult = tin(points, z);
  var extentBBox = extent(points);
  var squareBBox = square(extentBBox);
  var gridResult = grid(squareBBox, resolution);
  var data = [];

  gridResult.features.forEach(function(pt){
    tinResult.features.forEach(function(triangle){
      if (inside(pt, triangle)) {
        pt.properties = {};
        pt.properties[z] = planepoint(pt, triangle);
      }
    });
    if(!pt.properties){
      pt.properties = {};
      pt.properties[z] = -100;
    }
  });

  var depth = Math.sqrt(gridResult.features.length);
  for (var x=0; x<depth; x++){
    var xGroup = gridResult.features.slice(x * depth, (x + 1) * depth);
    var xFlat = [];
    xGroup.forEach(function(verticalPoint){
      if(verticalPoint.properties){
        xFlat.push(verticalPoint.properties[z]);
      } else{
        xFlat.push(0);
      }
    });
    data.push(xFlat);
  }
  var interval = (squareBBox[2] - squareBBox[0]) / depth;
  var xCoordinates = [];
  var yCoordinates = [];
  for (var x=0; x<depth; x++){
    xCoordinates.push(x * interval + squareBBox[0]);
    yCoordinates.push(x * interval + squareBBox[1]);
  }

  //change zero breaks to .01 to deal with bug in conrec algorithm
  breaks = breaks.map(function(num) {
    if(num === 0){
      return 0.01;
    }
    else{
      return num;
    }
  });
  //deduplicate breaks
  breaks = unique(breaks);

  var c = new Conrec();
  c.contour(data, 0, resolution, 0, resolution, xCoordinates, yCoordinates, breaks.length, breaks);
  var contourList = c.contourList();

  var fc = featurecollection([]);
  contourList.forEach(function(c){
    if(c.length > 2){
      var polyCoordinates = [];
      c.forEach(function(coord){
        polyCoordinates.push([coord.x, coord.y]);
      });
      polyCoordinates.push([c[0].x, c[0].y]);
      var poly = polygon([polyCoordinates]);
      poly.properties = {};
      poly.properties[z] = c.level;
      fc.features.push(poly);
    }
  });

  return fc;
};

function addEdges(points, z, resolution){
  var extentBBox = extent(points),
    sizeResult;

  var squareBBox = square(extentBBox);
  var sizeBBox = size(squareBBox, 0.35);

  var edgeDistance = sizeBBox[2] - sizeBBox[0];
  var extendDistance = edgeDistance / resolution;

  var xmin = sizeBBox[0];
  var ymin = sizeBBox[1];
  var xmax = sizeBBox[2];
  var ymax = sizeBBox[3];

  //left
  var left = [[xmin, ymin],[xmin, ymax]];
  for(var i = 0; i<=resolution; i++){
    var pt = point([xmin, ymin + (extendDistance * i)]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  var i, pt;

  //bottom
  var bottom = [[xmin, ymin],[xmax, ymin]];
  for(i = 0; i<=resolution; i++){
    pt = point([xmin + (extendDistance * i), ymin]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  //right
  var right = [[xmax, ymin],[xmax, ymax]];
  for(i = 0; i<=resolution; i++){
    pt = point([xmax, ymin + (extendDistance * i)]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  //top
  var top = [[xmin, ymax],[xmax, ymax]];
  for(i = 0; i<=resolution; i++){
    pt = point([xmin + (extendDistance * i), ymax]);
    pt.properties = {};
    pt.properties[z] = -100;
    points.features.push(pt);
  }

  return points;
}

function unique(a) {
  return a.reduce(function(p, c) {
      if (p.indexOf(c) < 0) p.push(c);
      return p;
  }, []);
}
