(function(){
  var $age, age, x$;
  $age = $('#age');
  if ($age.length !== 0) {
    age = Date.now() - new Date(1984, 12, 14, 10).getTime();
    age /= 10 * 86400 * 365;
    console.log(age);
    x$ = $age;
    x$.text(~~age / 100);
    x$.initHan();
  }
}).call(this);
