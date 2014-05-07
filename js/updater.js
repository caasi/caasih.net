(function(){
  var ModifiedChecker;
  ModifiedChecker = (function(){
    ModifiedChecker.displayName = 'ModifiedChecker';
    var prototype = ModifiedChecker.prototype, constructor = ModifiedChecker;
    function ModifiedChecker(url, interval){
      this.url = url != null
        ? url
        : window.location.href;
      this.interval = interval != null ? interval : 5000;
      this.id = void 8;
    }
    prototype.stop = function(){
      clearInterval(this.id);
      return this.id = void 8;
    };
    prototype.run = function(onUpdate){
      var this$ = this;
      $.ajax({
        type: 'HEAD',
        url: this.url,
        cache: false,
        ifModified: true
      });
      if (this.id) {
        this.stop();
      }
      return this.id = setInterval(function(){
        return $.ajax({
          type: 'HEAD',
          url: this$.url,
          cache: false,
          ifModified: true,
          success: function(data, status, xhr){
            if (xhr.status !== 304) {
              if (typeof onUpdate === 'function') {
                onUpdate();
              }
            }
          }
        });
      }, this.interval);
    };
    return ModifiedChecker;
  }());
  this.ModifiedChecker = ModifiedChecker;
}).call(this);
