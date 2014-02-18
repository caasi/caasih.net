mod = angular.module 'caasi' <[caasi.services]>
.directive \lyDiff (model) ->
  model.get 'bills/970L19045/data'
    .success (data, status, headers, config) ->
      console.log data, status, headers, config
  restrict: \A
  scope: true
  templateUrl: './diff.html'
