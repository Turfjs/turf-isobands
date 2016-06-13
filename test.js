var test = require('tape');
var fs = require('fs');
var turfPointGrid = require('turf-point-grid');
var isobands = require('./');
//var pointGrid = require('./Points');

test('isobands', function(t){
  var points = JSON.parse(fs.readFileSync(__dirname+'/geojson/Points2.geojson'));

  var isobanded = isobands(points, 'elevation', [5, 45, 55, 65, 85,  95, 105, 120, 180], false);

  t.ok(isobanded.features, 'should take a set of points with z values and output a set of filled contour polygons');
  t.equal(isobanded.features[0].geometry.type, 'Polygon');

  fs.writeFileSync(__dirname+'/geojson/isobands.geojson', JSON.stringify(isobanded));
  t.end();
});

// var extent = [-70.823364, -33.553984, -69.823364, -32.553984];
// var cellWidth = 5;
// var units = 'miles';
//
// var pointGrid = turfPointGrid(extent, cellWidth, units);
// for (var i = 0; i < pointGrid.features.length; i++) {
//     pointGrid.features[i].properties.elevation = Math.random() * 10;
// }
// console.dir(JSON.stringify(pointGrid));
//
// isobands(pointGrid, 'elevation', [0, 2, 4, 6, 8]);
// // console.dir(isobands(pointGrid, 'elevation', [0, 2, 4, 6, 8]));
