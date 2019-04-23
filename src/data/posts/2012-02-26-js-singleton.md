```javascript
var Normal = function() {
    //initialize here
    this.x = 1;
    this.y = 2;
};

var Singleton = function() {
    var shared = function() {
        //initialize here
        this.x = 10;
        this.y = 20;
    };
    
    shared.meow = function() {
        console.log("meow!");
    };

    return function() {
        return shared;
    };
}();

/* show time! */

var a0 = new Normal();
var a1 = new Normal();

a0.x = 0;

console.log(a0 == a1); // false
console.log(a0.x); // 0
console.log(a1.x); // 1

var b0 = new Singleton();
var b1 = new Singleton();

b0.x = 15;
b0.meow(); // meow!

console.log(b0 == b1); // true
console.log(b0.x); // 15
console.log(b1.x); // 15
```

I think this is much clear than [this one](http://stackoverflow.com/questions/1479319/simplest-cleanest-way-to-implement-singleton-in-javascript), but THE reputation system on stackoverflow prevents me from answering it :D

The key of this code is that JavaScript&#8217;s construct will return an object instead of a new instance if it return any kind of object! Such a strange language!

With delegate/proxy, we can reuse without class, with closure, we can accomplish encapsulation without keywords, what&#8217;s more?

