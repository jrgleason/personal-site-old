var app = angular.module('plunker', []);
var width = window.innerWidth,
    height = 1160;

app.controller('MainCtrl', function($scope) {
  $scope.name = 'World';
});

d3.selectAll(".item").filter(":nth-child(odd)").style("background-color", "green");

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var projection = d3.geo.mercator()
    .translate([width, height/ 2])
    .scale();
var projection = d3.geo.albers()
    .rotate([96, 0])
    .center([-.6, 38.7])
    .parallels([29.5, 45.5])
    .scale(1700)
    .translate([width / 2, height / 2])
    .precision(.1);
var path = d3.geo.path()
    .projection(projection);
d3.json("../shp/us2.json", function(error, us) {
  if (error) return console.error(error);

  // svg.append("path")
  //   .datum(topojson.feature(us, us.objects.subunits))
  //   .attr("d", path);
  var collection = topojson.feature(us, us.objects['us-base']).features;
  // var water = topojson.mesh(us, us.objects['us-base'], function(a, b) { return a !== b && a.properties.TYPE === "Water"; })
  var final = [];
  var ohio;
  _.forEach(collection, function(item){
    if(item.properties.TYPE == "Land"){
      final.push(item);
      if(item.properties.NAME == "Ohio"){
        ohio = item;
      }
    }
  });  
  svg.selectAll(".us-base")
     .data(collection)
     .enter()
     .append("path")
     .attr("class", function(d) {
       if(d.properties.TYPE == "Land"){
           return "state "+d.properties.NAME;
       } 
       else if(d.properties.TYPE == 'Water'){
           return "water";
       }
     })
     .attr("d", path);
  // svg.append("path")
  //   .datum(water)
  //   .attr("d", path)
  //   .attr("class", "water");
  svg.selectAll(".us-base-label")
    .data(collection)
    .enter()
    .append("text")
    .attr("class", function(d) { return "subunit-label " + d.id; })
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.properties.name; });
});
