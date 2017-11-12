前幾周 C 開始了個[快快樂樂寫 Haskell compiler ](https://github.com/CindyLinz/BYOHC-Workshop)的活動。按傳統，學 FP 要從 lambda calculus 開始，前兩週的作業就是寫 lambda calculus interpreter ，再試著使用實作環境內建的 function 並想辦法加速計算過程。

據說 interpreter 比 parser 好寫，於是一開始大家一起操作著以 JSON 表示的 AST 。

```
λa λb b a
```

寫成：

```
\a \b b a
```

表示成：

```
["lam", "a",
	["lam", "b",
  	["app",
    	["var", "b"],
      	["var", "a"]]]]
```

已經有[測資](https://github.com/CindyLinz/BYOHC-Workshop/blob/master/workshop-2015.9.24.md#測試用範例資料)，但手寫 JSON 實在是太苦悶了，不管怎樣還是想弄個 parser 出來。技術不好，不追求 one-pass ，只求能動就好。

## parsing

處理 lambda calculus 時，我沒想清楚 lambda application 該怎麼處理，繞了很多路。其實只要算好這層有哪些 lambda term ，就可以處理好。

例如在省略括號時：

```
(Y (\a \b a) c d \a \b b)
```

有五個 lambda term ： `Y`, `\a \b a`, `c`, `d`, `\a \b b` 。注意省略括號時，看到 lambda abstract 開頭的 `\` ，就可以知道從這個字到最後，是一整個 lambda term ，先不用費心處理。

所有的 lambda abstract （可以說就是 function 啦）都 currying 化了，只有一個參數。於是只要把：

```
["Y", "\a \b a", "c", "d", "\a \b b"]
```

變成這樣的 binary tree ：

```
[[[["Y", "\a \b a"], "c"], "d"], "\a \b b"]
```

就好了！裡面的東西，再遞迴地做下去。

## lazy evaluation （偽）

有了 parser 和[照著教學](https://github.com/CindyLinz/BYOHC-Workshop/blob/master/workshop-2015.9.24.md)做的 interpreter ，接下來要試著加速計算過程。

@LCamel 提供了個好測資：

```
(\w
  (w (w (w (w (w (w (w (w (\x x)))))))))
)(\x (x (x (x (x (x (x (x (x (x x))))))))))
```

如果不做任何加速，我的 interpreter 要跑 1m5.417s 。要是把算過的結果記下來，只要 0m0.325s ！

現在的作法是：

1. 先把 AST 中的變數名稱都丟掉，用不需要名稱的 [De Bruijn index](https://www.wikiwand.com/en/De_Bruijn_index) 來表示。
2. 把正要計算的 application serialize 成以 De Bruijn index 表示的字串，當成 key ，把計算結果當成 value 。
3. 存到 key-value map 裡。

於是：

```
(\a \b a)(\a \b b)(\a \b a)
```

會變成：

```
(\ \ 2)(\ \ 1)(\ \ 2)
```

其中 2 表示「跟我這個變數 bind 在一起的是，在我外面 2 層的 lambda abstract」， 1 同理。

計算結果是 `(\a \b b)` 則以：

```
["lam", "a",
	["lam", "b",
  		["var", "b"]]]
```

的形狀存下來，之後可以直接用。
