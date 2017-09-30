var app = angular.module('plunker', ['ngMaterial']);

function YearController($scope, $mdDialog, $mdMedia) {
    console.log("anchor");
    var _this = this;

    _this.charge = -800
    _this.force = d3.layout.force();

    this.changeForce = function() {
        if (_this.force) {
            _this.force.stop();
        }
        _this.force
            .nodes($scope.nodes)
            .links($scope.relationships)
            .size([$scope.width, $scope.height])
            .charge(_this.charge)
            .linkDistance("100")

            .on("tick", tick)
            .start()
    }
    // Move nodes toward cluster focus.
    function gravity(alpha) {
        return function(d) {
            // d.y += (d.cy - d.y) * alpha;
            d.x += (d.cx - d.x) * alpha;
        };
    }
    var removeSelectedNode = function(a, b) {
        var result = [];
        angular.forEach($scope.relationships, function(link) {
            if ((link.source.index == a || link.source.index == b) && (link.target.index == a || link.target.index == b)) {
                // it should be deleted
            } else {
                this.push(link)
            }
        }, result);
        $scope.relationships = result;
        $scope.render();
        $mdDialog.hide();
    }
    $scope.render = function() {
        _this.changeForce();
        var lines = $scope.svg
            .selectAll("line.relationship")
            .data($scope.relationships)
        lines.exit().remove();
        lines.enter()
            .append("line")
            .attr("class", "relationship")
            .style({
                "stroke": "black",
                // TODO: Make dynamic for now large for useability
                "stroke-width": "8"
            })
            .on("click", function(d) {
                // Appending dialog to document.body to cover sidenav in docs app
                // Modal dialogs should fully cover application
                // to prevent interaction outside of dialog
                $scope.selectedSource = d.source.index;
                $scope.selectedTarget = d.target.index;
                $mdDialog.show(
                    $mdDialog.alert({
                        templateUrl: "dialog.html",
                        bindToController: true,
                        controller: function($scope, $mdDialog, outerScope, remove) {
                            $scope.remove = remove;
                            $scope.outerScope = outerScope;
                            $scope.rejectDelete = function() {
                                $mdDialog.hide();
                            }
                            $scope.applyDelete = function() {
                                $scope.remove($scope.outerScope.selectedTarget, $scope.outerScope.selectedSource);
                            }
                        },
                        locals: {
                            outerScope: $scope,
                            remove: removeSelectedNode
                        }
                    })
                );

            })
            .on("mouseover", function(d) {
                d3.select(this).style('stroke', "green")
            })
            .on("mouseout", function(d) {
                d3.select(this).style('stroke', "black")
            });

        var circles = $scope.svg
            .selectAll("circle")
            .data($scope.nodes)
        circles.exit().remove();
        circles.enter()
            .append("circle")
            .attr("r", function(d) {
                return d.radius;
            })
            .attr("fill", function(d) {
                return d.color;
            })
            .on("mouseover", function(d) {
                if ($scope.currentIndex != null && d.index != $scope.currentIndex) {
                    _this.relToNode = d.index;
                    _this.currentSelectedNode = d3.select(this);
                    _this.currentSelectedNode.attr('fill', "green")
                } else {
                    console.log("There was still something happening " + $scope.currentIndex + " " + d.index)
                }
                //createTooltip(d.x , d.y , "this is a test");
            })
            .on("mouseout", function(d) {
                if ($scope.currentIndex && d.index != $scope.currentIndex) {
                    _this.currentSelectedNode.attr('fill', d.color)
                }
                if (d.index != $scope.currentIndex) {
                    //removeTooltip();
                }
            })
            .on("mousedown", function(d) {
                $scope.currentIndex = d.index;
                var m = d3.mouse(this);
                _this.futureRel = $scope.svg.append("line")
                    .attr("x1", d.x)
                    .attr("y1", d.y)
                    .attr("x2", m[0])
                    .attr("y2", m[1])
                    .attr("stroke-width", 2)
                    .attr("stroke", "black");
                $scope.svg
                    .on("mousemove", function() {
                        var m = d3.mouse(this);
                        _this.futureRel.attr("x2", m[0])
                            .attr("y2", m[1]);
                    })
                    .on("mouseup", function(d) {
                        if ($scope.currentIndex !== null && _this.relToNode !== null) {
                            // Since we have them both lets add a relationship
                            $scope.relationships.push({
                                source: $scope.currentIndex,
                                target: _this.relToNode,
                                value: 2
                            })
                            _this.currentSelectedNode.attr('fill', function(d) {
                                return d.color;
                            })
                            $scope.render();
                        }
                        $scope.currentIndex = null;
                        _this.relToNode = null;
                        _this.currentSelectedNode = null;
                        _this.futureRel.remove();
                        $scope.svg.on("mousemove", null);

                    });
            })

    }

    function createTooltip(x, y, text) {
        _this.tooltip = $scope.svg.append('g')
            .attr("class", "tooltip")
        var fo = _this.tooltip.append('foreignObject')
            .attr({
                'x': x,
                'y': y,
                'width': "200px",
                'class': 'svg-tooltip'
            });

        var div = fo.append('xhtml:div')
            .append('div')
            .attr({
                'class': 'tooltip'
            });
        div.append('p')
            .attr('class', 'lead')
            .html(text);
        var br = div[0][0].getBoundingClientRect()
        foHeight = br.height,
            foWidth = br.width
        fo.attr({
            'height': foHeight
        });
        _this.tooltip.insert('polygon', '.svg-tooltip')
            .attr({
                'points': "0,0 0," + foHeight + " " + 200 + "," + foHeight + " " + 200 + ",0 " + ",0",
                'height': foHeight,
                'width': foWidth,
                'fill': '#D8D8D8',
                'transform': 'translate(' + x + ',' + y + ')'
            });

    }

    function removeTooltip() {
        _this.tooltip.remove();
    }

    function tick(e) {
        var q = d3.geom.quadtree($scope.nodes),
            i = 0,
            n = $scope.nodes.length,
            k = 6 * e.alpha;
        // items.forEach(function(o, i) {
        //   o.y += i & 1 ? k : -k;
        //   o.x += i & 2 ? k : -k;
        // });
        //if (!_this.currentIndex) {
        while (++i < n) {
            q.visit(collide($scope.nodes[i]));
        }
        // }

        $scope.svg
            .selectAll("line.relationship")
            .attr("x1", function(d) {
                d.cc = getAllCords(d);
                return d.cc.x1;
            })
            .attr("y1", function(d) {
                return d.cc.y1;
            })
            .attr("x2", function(d) {
                return d.cc.x2;
            })
            .attr("y2", function(d) {
                return d.cc.y2;
            })
        $scope.svg.selectAll("circle")
            .attr("cx", function(d) {
                return d.x
            })
            .attr("cy", function(d) {
                return d.y
            })
        // $scope.svg.selectAll("circle").each(gravity(.2 * e.alpha))
    }

    function getAllCords(d) {
        var x1, x2, y1, y2;
        if (d.source.x <= d.target.x) {
            x1 = d.source.x;
            x2 = d.target.x;
        } else {
            x2 = d.source.x;
            x1 = d.target.x;
        }
        if (d.source.y > d.target.y) {
            y1 = d.source.y;
            y2 = d.target.y;
        } else {
            y2 = d.source.y;
            y1 = d.target.y;
        }
        var sourceTheta = getTheta(x1, x2, y1, y2),
            targetTheta = (Math.PI / 2) - sourceTheta,
            multiplier = getDirection(d.source.x, d.target.x, d.source.y, d.target.y),
            sourcePreCords = getCircleCords(sourceTheta, d.source.radius),
            targetPreCords = getCircleCords(targetTheta, d.target.radius);
        return {
            x1: sourcePreCords[0] * multiplier[0] + d.source.x,
            y1: sourcePreCords[1] * multiplier[1] + d.source.y,
            x2: targetPreCords[1] * (-1 * multiplier[0]) + d.target.x,
            y2: targetPreCords[0] * (-1 * multiplier[1]) + d.target.y
        }
    }

    function getDirection(sourceX, targetX, sourceY, targetY) {
        var xDistance = sourceX - targetX,
            xMultiplier = xDistance < 0 ? 1 : -1,
            yDistance = sourceY - targetY,
            yMultiplier = yDistance < 0 ? 1 : -1;
        return [xMultiplier, yMultiplier];
    }

    function getTheta(x1, x2, y1, y2) {
        var x = Math.abs(x2 - x1),
            y = Math.abs(y2 - y1),
            h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
        return Math.acos(x / h)
    }

    function getCircleCords(theta, r) {
        var x = Math.cos(theta) * r;
        var y = Math.sin(theta) * r;
        return [x, y];
    }

    function collide(node) {
        if (node.index != $scope.currentIndex) {
            var r = node.radius + 32,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        } else {
            return function() {
                return true;
            }
        }
    }
}
app.directive('jgViz', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: "/javascripts/graph.html",
        controllerAs: "ctrl",
        controller: YearController,
        link: function($scope, element, attrs) {
            var firstElement = element[0];
            $scope.relationships = [];
            var _this = this;
            var types = [{
                label: 'FAA_LINE',
                color: randomColor()
            }, {
                label: 'EASA_LINE',
                color: randomColor()
            }, {
                label: 'ICAO_LINE',
                color: randomColor()
            }];
            _this.foci = d3.scale.ordinal()
                .domain(d3.range(types.length))
                .rangePoints([0, 500], 1);

            $scope.nodes = d3.range(20).map(function() {

                var i = Math.floor(Math.random() * types.length)
                var rand = types[i];
                return {
                    radius: Math.random() * 36 + 10,
                    label: rand.label,
                    color: rand.color,
                    cx: _this.foci(i)

                };
            });

            // Accounting 48 for header and 17 for scroll
            function updateSize() {
                $scope.height = firstElement.clientHeight - 48 - 17;
                $scope.width = firstElement.clientWidth - 17;
                $scope.svg.attr("height", $scope.height)
                    .attr("width", $scope.width);
                $scope.render();
            }
            window.onresize = function(event) {
                updateSize();
            }
            var report = d3.select(firstElement);
            $scope.svg = report.append("svg")
                .on("mousedown", function(d) {
                    if($scope.currentIndex == null){
                        var coordinates = d3.mouse(this),
                            x = coordinates[0],
                            y = coordinates[1];
                        var i = Math.floor(Math.random() * types.length)
                        var rand = types[i];
                        $scope.nodes.push({
                            radius: Math.random() * 36 + 10,
                            label: rand.label,
                            color: rand.color
                        });
                        $scope.render();
                    }
                    console.log("We should create")
                });

            updateSize();
        }
    }
});