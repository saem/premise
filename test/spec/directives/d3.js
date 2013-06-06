'use strict';

describe('Directive: ', function () {
  beforeEach(module('premiseApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<></>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the  directive');
  }));
});
