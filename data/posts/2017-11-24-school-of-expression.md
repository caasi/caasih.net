昨天（11/23）在母校圖書館發現 "the Haskell School of Expression: Learning Functional Programming through Multimedia" 。

還想說誰那麼狂，竟然取這種書名，原來是大佬 Paul Hudak 。

#haskell.tw 上， monochrom 說：

> 視乎你好哪個學習方向. Hudak 應該是唯一一個一早就有 graphics 有 IO 的.  
> 所以看你喜歡一開始就有眼睛冰淇淋還是一開始就有 pure function 和 algebraic data types.

— monochrom@freenode

其實看到標題時，第一個念頭還是想到那喜歡 pure functional language 也喜歡工程的朋友。不知道能不能從中找到對方也會有興趣的 lib 或技巧？再來我很需要看看別人怎麼用 Haskell 做「真正的應用程式」，之前讀的教學書，主題仍是 compiler 。

---

第一章作者試著教大家用 Haskell 寫程式，也介紹了數字系統可能有的問題。但並沒有詳細說明怎麼安裝 Hugs 或 ghc 。這不是一本入門書，想入門 Haskell ，還是得讀 [Learn You a Haskell for Great Good][LYaH] 或 [Haskell Programming from First Principle][HPfFP] 。更推薦後者，雖然它頁數多，但真的帶著讀者開始寫程式，而不會讓你誤以為「自己用看的就懂了」。

那個年代沒有什麼入門書，可憐的讀者一直被建議去讀 [Haskell Report][Report] XDDD

[LYaH]: http://learnyouahaskell.com/
[HPfFP]: http://haskellbook.com/
[Report]: https://www.haskell.org/onlinereport/

---

第二章除了方啊圓啊三角形外，馬上就加入多邊形。看來會有一段愉快的旅程 XD

---

一個工作的時程安排出錯，就一整週沒辦法看書。

```
module Shape (...) where

data Shape
  = Rectangle Side Side
  | Ellipse Radius Radius
  | RtTriangle Side Side
  | Polygon [Vertex]
  deriving Show

type Radius = Float
type Side = Float
type Vertex = (Float, Float)

square s = Rectangle s s
circle r = Ellipse r r
rectangle s0 s1 = Rectangle s0 s1
rtTriangle s0 s1 = RtTriangle s0 s1

regularPolygon :: Int -> Side -> Shape
regularPolygon n s 
  = let
      r = pi / n
      factor = s / (2 * sin r)
    in
      map (\i -> rotate (i * r) (factor, 0)) [0..n]

rotate :: Radius -> Vertex -> Vertex
rotate r (x, y) = ((x * cos r) - (y * sin r), (x * sin r) + (y * cos r))

resize :: Float -> Vertex -> Vertex
resize n (x, y) = ((x * n), (y * n))
```

pedagogy 是什麼意思？

看 sum type 來決定 function 實作，是一種 polymorphism 嗎？

看看：

```
class Eq a where
  (==) :: a -> a -> Bool
  (/=) :: a -> a -> Bool

elem :: Eq a => a -> [a] -> Bool
elem y []       = False
elem y (x : xs) = (x == y) || elem y xs
```

如果沒有 type class ，那若得寫一個通用的 `elem` ，就得 pattern match 所有可能的 type `a` ，選擇對應的 `(==)` 。

但和 OO 不同， interface 只看第一個參數（`a.eq(b)` 的 `a`）來決定實作。

使用者可以自行讓新的 type 屬於某個 type class ，但卻無法擴充某個 sum type ，把新的 constructor 加進去。

得把 `Shape.hs` 還有 project repo 開出來。
