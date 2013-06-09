'use strict';

angular.module('premiseApp')

  // This turns every svg tag into a directive, which has a controller,
  //   so we can expose the svg element via the d3 API and declaratively manipulate it with nested directives.

  .directive('d3Svg', function() {
    var width = 960
      , height = 500
    ;
    
    return {
      restrict: 'A',
      controller: ['$element', '$attrs', function(element, attrs) {
        this.height = attrs.$attr.height;
        this.width  = attrs.$attr.width;
        
        this.svg = d3.select(element[0]);
        this.svgJQLite = element;
      }],
      compile: function compile(element, attrs) {
        var elem = element[0];

        if(!attrs.$attr.width) {
          element.attr('width', width);
        }
        
        if(!attrs.$attr.height) {
          element.attr('height', height);
        }
        
        return function postLink() {
        }
      }
    };
  })

  // Create a new element which creates a d3 force graph, will be referred to as d3-force in the html

  .directive('d3Force', function () {
    
    // defaults for all instances of the graph
    
    var color = d3.scale.category20();
      ;

    // We return an object description of the directive, the angular compiler uses this to expand it's "vocabulary"

    return {
      restrict: 'E',  // this directive can only be used as an attribute
      
      scope: {
        graph: '=',
        linkDistance: '=',
        charge: '='
      },
      
      require: '^d3Svg',
      
      // The compile function does 'static' DOM manipulations
      // Attributes:
      //        color: d3.scale.<color>() provide a color category
      
      compile: function compile(element, attrs) {
        var c = d3.scale[attrs.$attr.color] && d3.scale[attrs.$attr.color]() || color
          , force = d3.layout.force()
        ;
        
        // This does the actual work when the data on the scope is available
        
        return function postLink(scope, element, attrs, d3SvgController) {
          
          // create the force graph
          
          var graph = scope.graph
            , link
            , node
            , linkDistance = scope.linkDistance || 30
            , charge = scope.charge || -120
            , svg = d3SvgController.svg
          ;

          // This is straight up d3, make the initial graph
          
          force
            .size([svg.attr('width'), svg.attr('height')])
            .charge(charge)
            .linkDistance(linkDistance)
            .nodes(graph.nodes)
            .links(graph.links)
            .start();
          
          // Watch the node and links for changes and call the appropriate render methods
          
          scope.$watch(scope.graph.nodes, renderNodes);
          scope.$watch(scope.graph.links, renderLinks);
          
          // Setup the animations to go with the dragging
          
          force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
          });
          
          function renderNodes() {
            
            // NB: This is required as we're called multiple times so we clear out the old stuff, ideally, we should clear changes, but we're not there yet
            
            svg.selectAll('.node').remove();
            
            // D3 node drawing code
            
            node = svg.selectAll(".node")
              .data(graph.nodes)
              .enter()
              .append("circle")
              .attr("class", "node")
              .attr("r", 5)
              .style("fill", function(d) { return color(d.group); })
              .call(force.drag);

            // @todo Find out if this can be changed so it's only done once
              
            node.append("title")
              .text(function(d) { return d.name; });
          }
          
          function renderLinks() {
            
            // NB: This is required as we're called multiple times so we clear out the old stuff, ideally, we should clear changes, but we're not there yet
            
            svg.selectAll('.link').remove();
            
            // D3 link drawing code
            
            link = svg.selectAll(".link")
              .data(graph.links)
              .enter()
              .append("line")
              .attr("class", "link")
              .style("stroke-width", function(d) { return Math.sqrt(d.value); });
          }
        };
      }
    };
  })
  ;
