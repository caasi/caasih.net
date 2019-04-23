**Updated.**

```javascript
var f = function() {
    var __kind = "O";

    return function(name) {
        // private things here
        var _vars = {};
        _vars["kind"] = function() {
            return __kind;
        };
        _vars["name"] = name || "anonymous";
        
        // then return a new instance
        // this should be hide by rewriting
        return {
            get: function(key) {
                return _vars[key];
            },
            set: function(key, value) {
                _vars[key] = value;
            }
        };
    };
};

// first () create a closure with internal vars
// second () create an instance
// well, it also looks like "OO"
var o = f()();

// or in this way
var cls = f();
var p = cls("sam");

o["set"]("x", 10);
p["set"]("x", 20);
console.log("o.name: " + o["get"]("name"));
console.log("o.kind(): " + o["get"]("kind")());
console.log("o.x: " + o["get"]("x"));
console.log("p.name: " + p["get"]("name"));
console.log("p.kind(): " + p["get"]("kind")());
console.log("p.x: " + p["get"]("x"));

// attention: no . notation so far
```

What will it looks like after rewrite.

```javascript
f = () {
    return (name) {
        @@kind = "O";
        @kind = () {
            return __kind;
        };
        @name = name || "anonymous";
        return $;
    };
};

o = f()();

cls = f();
p = cls();

o.x = 10;
p.x = 20;
log("o.kind(): " + o.kind());
log("o.x: " + o.x);
log("p.kind(): " + p.kind());
log("p.x: " + p.x);
```

