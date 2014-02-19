this.BillsCtrl = ($scope, model) ->
  $scope.bills =
    \989L16035
    \970L19045
    \1619L16058
    ...
  $scope.get = (bill) ->
    model.get "bills/#{bill}/data" .success (data) ->
      console.log data
      contents = data.content.0.content
      for content in contents
        console.log model.parse content.0
