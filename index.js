//http://emptypipes.org/2015/07/22/contour-comparison/


var MarchingSquaresJS = require('./marchingsquares-isobands');
//from https://github.com/RaumZeit/MarchingSquares.js, added module.export

var turfFeaturecollection = require('turf-featurecollection');
var turfPolygon = require('turf-polygon');

/*******************************************************************
 * Takes a grid ({@link FeatureCollection}) of {@link Point} features with z-values and an array of
 * value breaks and generates filled contour isobands.
 *
 * @module turf/isobands
 * @category interpolation
 * @param {FeatureCollection} grid of points, a FeatureCollection of {@link Point} features
 * @param {string} z the property name in `points` from which z-values will be pulled
 * @param {Array<number>} breaks where to draw contours
 * @returns {FeatureCollection} a FeatureCollection of {@link Polygon} features representing isobands
 * @example
 * // create random points with random
 * // z-values in their properties
 * var extent = [-70.823364, -33.553984, -69.823364, -32.553984];
 * var cellWidth = 5;
 * var units = 'miles';
 * var pointGrid = turf.pointGrid(extent, cellWidth, units);
 * for (var i = 0; i < pointGrid.features.length; i++) {
 *     pointGrid.features[i].properties.elevation = Math.random() * 10;
 * }
 * var breaks = [0, 5, 8.5];
 * var isolined = turf.isobands(pointGrid, 'z', breaks);
 * //=isolined
 ******************************************************************/
module.exports = function (pointGrid, z, breaks) {


    var Points = pointGrid.features;
    //console.log(Points[0].geometry);
    var getLatitude = function (point) {
        return point.geometry.coordinates[1];
    };
    var getLongitude = function (point) {
        return point.geometry.coordinates[0];
    };


    /*####################################
     divide pointGrid by Latitude, creating a 2-dimensional data grid
     ####################################*/
    var pointsByLatitude = {};
    for (var j = 0; j < Points.length; j++) {
        if (!pointsByLatitude[getLatitude(Points[j])]) {
            pointsByLatitude[getLatitude(Points[j])] = [];
        }
        //group obj by Lat value
        pointsByLatitude[getLatitude(Points[j])].push(Points[j]);
    }
    //create an array of arrays of points, each array representing a row (i.e. Latitude) of the 2D grid
    pointsByLatitude = Object.keys(pointsByLatitude).map(function (key) {
        return pointsByLatitude[key]
    });

    /*
     * pointsByLatitude is a matrix of points on the map; NOTE the position of the ORIGIN for MarchingSquaresJS
     *
     *  pointsByLatitude = [
     *     [ {point}, {point}, {point},  ... {point} ],
     *     [ {point}, {point}, {point},  ... {point} ],
     *     ...
     *     [ {ORIGIN}, {point}, {point},  ... {point} ]
     *  ]
     *
     **/

    //creates a 2D grid with the z-value of all point on the map
    var gridData = [];
    pointsByLatitude.forEach(function (pointArr, index, pointsByLat) {
        var row = [];
        //pointArr.reverse();
        pointArr.map(function (point, index, pointArr) {
            row.push(point.properties[z]);
        });
        gridData.push(row);
    });

    //console.log('gridData: ', JSON.stringify(gridData));
    /* example
     *   gridData = [
     *       [ 1, 13, 10,  9, 10, 13, 18],
     *       [34,  8,  5,  4,  5,  8, 13],
     *       [10,  5,  2,  1,  2,  5,  4],
     *       [ 0,  4, 56, 19,  1,  4,  9],
     *       [10,  5,  2,  1,  2,  5, 10],
     *       [57,  8,  5,  4,  5, 25, 57],
     *       [ 3, 13, 10,  9,  5, 13, 18],
     *       [18, 13, 10,  9, 78, 13, 18]
     *   ]
     */


    /*####################################
     getting references of the original grid of points (on the map)
     ####################################*/
    var lastC = pointsByLatitude[0].length - 1; //last colum of the data grid
    //get the distance (on the map) between the first and the last point on a row of the grid
    var originalWidth = getLongitude(pointsByLatitude[0][lastC]) - getLongitude(pointsByLatitude[0][0]);
    var lastR = pointsByLatitude.length - 1; //last row of the data grid
    //get the distance (on the map) between the first and the last point on a column of the grid
    var originalHeigth = getLatitude(pointsByLatitude[lastR][0]) - getLatitude(pointsByLatitude[0][0]);
    //console.log('originalWidth:', originalWidth, 'originalHeigth:', originalHeigth);

    //get origin, which is the first point of the last row on the rectangular data on the map
    var x0 = getLongitude(pointsByLatitude[0][0]);
    var y0 = getLatitude(pointsByLatitude[0][0]);
    //console.log('x0:', x0, 'y0:', y0);

    var gridWidth = gridData[0].length;
    var gridHeigth = gridData.length;
    //console.log('gridWidth:', gridWidth, 'gridHeigth:', gridHeigth);

    /*####################################
     creates the contours lines (featuresCollection of polygon features) from the 2D data grid

     MarchingSquaresJS process the grid data as a 3D representation of a function on a 2D plane, therefore it
     assumes the points (x-y coordinates) are one 'unit' distance. The result of the IsoBands function needs to be
     rescaled, with turfjs, to the original area and proportions on the google map
     ####################################*/
    // based on the provided breaks
    var isoBands = [];
    for (var i = 1; i < breaks.length; i++) {
        var lowerBand = +breaks[i - 1]; //make sure the breaks value is a number
        var upperBand = +breaks[i];
        var band = MarchingSquaresJS.IsoBands(gridData, lowerBand, upperBand - lowerBand);
        //console.log('band', band);
        var poly = {"coords": band, "z": +breaks[i] };
        poly.z = +breaks[i]; //ake sure it's a number
        isoBands.push(poly);
        //debugger;
    }
    //console.log('isoBands:', isoBands);

    //calculate the scaling factor between the unitary grid to the rectangle on the map
    var scaleX = originalWidth / gridWidth;
    var scaleY = originalHeigth / gridHeigth;
    //console.log('scaleX:', scaleX, 'scaleY', scaleY);

    //rescale and shift each point/line of the isobands
    isoBands.forEach(function (bandObj) {
        bandObj.coords.forEach(function (line) {
            line.forEach(function (point) {
                point[0] = point[0] * scaleX + x0; //rescaled x
                point[1] = point[1] * scaleY + y0; //rescaled y
            });
        });
    });
    //console.log('isoBands:', isoBands);

    // creates GEOJson polygons from the lineRings
    var polygons = isoBands.map(function (isoBand) {
      var opt = {};
      opt[z] = isoBand.z;
      return turfPolygon(isoBand.coords, opt);
    });

    //console.log('polygon:', JSON.stringify(polygons));
    //console.log(turfFeaturecollection(polygons).features[2]);

    //return a GEOJson featurecollection of polygons
    return turfFeaturecollection(polygons);

};
