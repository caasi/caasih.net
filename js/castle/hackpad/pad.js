(function(){
  var Hackpad, config, client;
  Hackpad = require('hackpad');
  config = {
    client: {
      id: 'rAwvR9u1O2d',
      secret: '8DYYhGinUcbbPHsLz0WBWxDwVgtMTR1o'
    }
  };
  client = new Hackpad(config.client.id, config.client.secret);
  client['export']('FRzDUBto4Vj', 'latest', 'txt', function(err, data){
    return console.log(err, data);
  });
}).call(this);
