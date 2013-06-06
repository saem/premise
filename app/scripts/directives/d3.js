'use strict';

angular.module('premiseApp')

  // Create a new element which creates a d3 force graph, will be referred to as d3-force in the html

  .directive('d3Force', function () {
    
    // defaults for all instances of the graph
    
    var width = 960
      , height = 500
      , color = d3.scale.category20();
      ;

    // We return an object description of the directive, the angular compiler uses this to expand it's "vocabulary"

    return {
      restrict: 'E',  // this directive can only be used as an attribute
      
      terminal: true,  // process me last
      
      // The compile function does 'static' DOM manipulations
      
      compile: function compile(element, attrs) {
        var w = attrs.$attr.width || width
          , h = attrs.$attr.height || height
          
          // Every instance of d3Force will add an svg element to the DOM, statically based on the width and height
          // Consequently, we can't do dynamic resizing of the graph based on data values, but it's faster
          
          , svg = d3.select(element[0]).append('svg').attr('width', w).attr('height', h)
          ;
          
        // This does the actual work when the data on the scope is available
        
        return function postLink(scope, element, attrs) {
          
          // create the force graph
          
          var force = d3.layout.force()
            .charge(-120)
            .linkDistance(30)
            .size([w, h])
            , graph = scope.graph
            , called = 0
            ;
          
          scope.$watch(scope.nodes, render);
          scope.$watch(scope.links, render);
            
          function render () {
            // todo: currently a design issue, this is called two times on startup, using this to track that, and to see how it might be fixed
            
            console.log(++called);
            
            // This is straight up d3
            
            force
              .nodes(graph.nodes)
              .links(graph.links)
              .start();

            // NB: This is required as we're called multiple times so we clear out the old stuff, ideally, we should clear changes, but we're not there yet
            
            svg.selectAll('*').remove();
            
            var link = svg.selectAll(".link")
              .data(graph.links)
              .enter()
              .append("line")
              .attr("class", "link")
              .style("stroke-width", function(d) { return Math.sqrt(d.value); });

            var node = svg.selectAll(".node")
              .data(graph.nodes)
              .enter()
              .append("circle")
              .attr("class", "node")
              .attr("r", 5)
              .style("fill", function(d) { return color(d.group); })
              .call(force.drag);

            node.append("title")
              .text(function(d) { return d.name; });

            force.on("tick", function() {
              link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

              node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            });
          };
        };
      }
    };
  });
