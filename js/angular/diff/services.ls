base = "http://api.ly.g0v.tw/v0/collections/"

angular.module 'caasi.services' []
.factory \model <[$q $http]> ++ ($q, $http) ->
  get: ->
    $http do
      method: \GET
      cache:  true
      url:    base + it
