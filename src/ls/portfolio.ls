converter = new Showdown.converter extensions: <[ github ]>
$.get "md/portfolio.md" ->
  html = converter.makeHtml it
  $article = $(\article#zh-tw).append html
  # compute age
  age = Date.now! - (new Date 1984 12 14 10).getTime!
  age /= 10 * 86400 * 365
  console.log age
  $(\#age).text (~~age) / 100
  # apply Han
  $article.hanInit!
