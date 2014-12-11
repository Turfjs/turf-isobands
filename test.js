var test = require('tape');
var fs = require('fs');
var isobands = require('./');

test('isobands', function(t){
  var points = JSON.parse(fs.readFileSync(__dirname+'/geojson/Points.geojson'));
  
  var isobanded = isobands(points, 'elevation', 15, [5, 45, 55, 65, 85,  95, 105, 120, 180], false);

  t.ok(isobanded.features, 'should take a set of points with z values and output a set of filled contour polygons');
  t.equal(isobanded.features[0].geometry.type, 'Polygon');

  fs.writeFileSync(__dirname+'/geojson/isobands.geojson', JSON.stringify(isobanded));
  t.end();
})