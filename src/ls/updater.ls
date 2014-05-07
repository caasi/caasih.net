class ModifiedChecker
  (@url = window.location.href, @interval = 5000) ->
    @id = void
  stop: ->
    clearInterval @id
    @id = void
  run: (on-update) ->
    # check once, so I will not get 200 after
    $.ajax do
      type: \HEAD
      url: @url
      cache: false
      if-modified: true
    if @id then @stop!
    @id = setInterval ~>
      $.ajax do
        type: \HEAD
        url: @url
        cache: false
        if-modified: true
        success: !(data, status, xhr) ~>
          on-update?! if xhr.status isnt 304
    , @interval

@ModifiedChecker = ModifiedChecker
