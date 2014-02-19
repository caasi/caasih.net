/*
base = "http://api.ly.g0v.tw/v0/collections/"

angular.module 'caasi.services' []
.factory \model <[$q $http]> ++ ($q, $http) ->
  get: ->
    $http do
      method: \GET
      cache:  true
      url:    base + it
  parse-heading: (heading) ->
    [_, ..._items]? = heading.match /第(.+)條(?:之(.+))?/
    return heading unless _items
    require! zhutil
    _items.filter -> it
    .map zhutil.parseZHNumber .join \-
  parse: (article) ->
    text: article - /^第(.*?)(條(之.*?)?|章|篇|節)\s+/
    heading: this.parse-heading RegExp.lastMatch - /\s+$/
*/
