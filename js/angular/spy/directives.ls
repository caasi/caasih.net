angular.module 'caasi' []
.directive \scrollSpy <[]> ++ ($scope) ->
  restrict: \A
  #scope: true
  transclude: true
  replace: true
  templateUrl: './tpl.html'
  controller: ($scope) ->
    $scope.targets = []
    $scope.$on 'spy:register' (e, target) ->
      $scope.targets.push target
.directive \spy <[$timeout]> ++ ($timeout) ->
  restrict: \A
  link: ($scope, elem, attrs) ->
    elem.attr \id $scope.$index
    $timeout ->
      $scope.$emit 'spy:register' do
        index: $scope.$index
        heading: elem.text!

