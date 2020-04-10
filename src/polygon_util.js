/*****************************************************************************
 * LICENSE
 *
 * This file is part of mss_vis.
 * 
 * If you use mss_vis in any program or publication, please inform and
 * acknowledge its authors.
 * 
 * mss_vis is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * mss_vis is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with mss_vis. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2019 Stefan Mertl
 *
 *
 * Based on original code by Steve Hollasch for Rounded Enclosing Hull
 * (http://bl.ocks.org/hollasch/f70f1fe7700f092b5a505e3efd1d9232) published 
 * under the MIT license.
 *****************************************************************************/

module.exports = {
    rounded_hull: function(polyPoints, hull_padding) {
        // Returns the SVG path data string representing the polygon, expanded and rounded.

        // Handle special cases
        if (!polyPoints || polyPoints.length < 1) return "";
        if (polyPoints.length === 1) return rounded_hull_1 (polyPoints, hull_padding);
        if (polyPoints.length === 2) return rounded_hull_2 (polyPoints, hull_padding);

        var segments = new Array (polyPoints.length);

        // Calculate each offset (outwards) segment of the convex hull.
        for (var segmentIndex = 0;  segmentIndex < segments.length;  ++segmentIndex) {
            var p0 = (segmentIndex === 0) ? polyPoints[polyPoints.length-1] : polyPoints[segmentIndex-1];
            var p1 = polyPoints[segmentIndex];

            // Compute the offset vector for the line segment, with length = hullPadding.
            var offset = vec_scale (hull_padding, unit_normal (p0, p1));

            segments[segmentIndex] = [ vec_sum (p0, offset), vec_sum (p1, offset) ];
        }

        var arcData = 'A ' + [hull_padding, hull_padding, '0,0,0,'].join(',');

        segments = segments.map (function (segment, index) {
            var pathFragment = "";
            if (index === 0) {
                pathFragment = 'M ' + segments[segments.length-1][1] + ' ';
            }
            pathFragment += arcData + segment[0] + ' L ' + segment[1];

            return pathFragment;
        });

        return segments.join(' ');
    },
};

var vec_sum = function (pv1, pv2) {
    // Returns the sum of two vectors, or a combination of a point and a vector.
    return [ pv1[0] + pv2[0], pv1[1] + pv2[1] ];
};

var vec_scale = function(scale, v) {
    // Returns the vector 'v' scaled by 'scale'.
    return [ scale * v[0], scale * v[1] ];
};

var unit_normal = function(p0, p1) {
    // Returns the unit normal to the line segment from p0 to p1.
    var n = [ p0[1] - p1[1], p1[0] - p0[0] ];
    var nLength = Math.sqrt (n[0]*n[0] + n[1]*n[1]);
    return [ n[0] / nLength, n[1] / nLength ];
};


var rounded_hull_1 = function(polyPoints, hull_padding) {
    // Returns the path for a rounded hull around a single point (a circle).

    var p1 = [polyPoints[0][0], polyPoints[0][1] - hull_padding];
    var p2 = [polyPoints[0][0], polyPoints[0][1] + hull_padding];

    return 'M ' + p1
        + ' A ' + [hull_padding, hull_padding, '0,0,0', p2].join(',')
        + ' A ' + [hull_padding, hull_padding, '0,0,0', p1].join(',');
};

var rounded_hull_2 = function (polyPoints, hull_padding) {
    // Returns the path for a rounded hull around two points (a "capsule" shape).

    var offsetVector = vec_scale (hull_padding, unit_normal (polyPoints[0], polyPoints[1]));
    var invOffsetVector = vec_scale (-1, offsetVector);

    var p0 = vec_sum (polyPoints[0], offsetVector);
    var p1 = vec_sum (polyPoints[1], offsetVector);
    var p2 = vec_sum (polyPoints[1], invOffsetVector);
    var p3 = vec_sum (polyPoints[0], invOffsetVector);

    return 'M ' + p0
        + ' L ' + p1 + ' A ' + [hull_padding, hull_padding, '0,0,0', p2].join(',')
        + ' L ' + p3 + ' A ' + [hull_padding, hull_padding, '0,0,0', p0].join(',');
};
