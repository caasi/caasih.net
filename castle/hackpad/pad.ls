Hackpad = require \hackpad

config =
  client:
    id: \rAwvR9u1O2d
    secret: \8DYYhGinUcbbPHsLz0WBWxDwVgtMTR1o

client = new Hackpad config.client.id, config.client.secret
client.export \FRzDUBto4Vj, \latest, \txt, (err, data) -> console.log err, data
