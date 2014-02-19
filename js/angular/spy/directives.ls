angular.module 'caasi' []
.directive \scrollSpy <[$window]> ++ ($window) ->
  restrict: \A
  #scope: true
  transclude: true
  replace: true
  templateUrl: './tpl.html'
  controller: ($scope) ->
    var p
    $window.onscroll = ({page-y}) ->
      var t
      for i of $scope.targets
        t = $scope.targets[i]
        break if t.top <= page-y < t.bottom
        t = null
      if p isnt t
        $scope.$apply ->
          p?highlight = off
          t?highlight = on
      p := t
    $scope.targets = []
    $scope.$on 'spy:register' (e, target) ->
      $scope.targets.push target
.directive \spy <[$timeout]> ++ ($timeout) ->
  restrict: \A
  link: ($scope, elem, attrs) ->
    elem.attr \id $scope.$index
    # TODO: should be dynamic
    top = elem.parent!position!top
    $timeout ->
      $scope.$emit 'spy:register' do
        index:   $scope.$index
        heading: elem.text!
        top:     top
        bottom:  top + elem.parent!height!

