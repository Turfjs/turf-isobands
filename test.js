var test = require('tape')
var fs = require('fs')
var isobands = require('./')

test('isobands', function(t){
  var points = JSON.parse(fs.readFileSync(__dirname+'/geojson/Points.geojson'))
  
  var isolined = isobands(points, 'elevation', 15, [25, 45, 55, 65, 85,  95, 105, 120, 180], false)

  t.ok(isolined.features, 'should take a set of points with z values and output a set of filled contour polygons')
  t.equal(isolined.features[0].geometry.type, 'LineString')

  fs.writeFileSync(__dirname+'/geojson/isobands.geojson', JSON.stringify(isolined))
  t.end()
})