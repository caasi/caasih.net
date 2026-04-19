<iframe width="740" height="555" src="https://www.youtube.com/embed/06x8Wf2r2Mc" frameborder="0" allowfullscreen></iframe>

沒想到 SPJ 同樣以 Being Lazy with Class 為名講過 Haskell 的歷史，非常歡樂 XD

目前好奇的部分有：

  * [type classes][type-classes] 一開始就存在了，是為了 `(==)` ，還用一張投影片展示其實作背後的概念
  * 介紹 [QuickCheck][QuickCheck] 如何善用 type classes （一半聽不懂），並建議大家讀論文 XD
  * 介紹了 GHC 中的 [SystemFC][SystemFC] ，和 IFL 中的 Core 差距滿大的，但小到一張投影片就塞得下！

```
data Expr
  = Var    Var
  | Lit    Literal
  | App    Expr Expr
  | Lam    Var Expr
  | Let    Bind Expr
  | Case   Expr Var Type [(AltCon, [Var], Expr)]
  | Cast   Expr Coercion
  | Note   Note Expr
  | Type   Type
type Coercion = Type
data Bind   = NonRec Var Expr | Rec [(Var, Expr)]
data AltCon = DEFAULT | LitAlt Lit | DataAlt DataCon
```

不知道哪天可以搞懂？ XD

---

最後一個問問題的人是 Guy Steele ！？

[type-classes]: https://youtu.be/06x8Wf2r2Mc?t=1513
[QuickCheck]: https://youtu.be/06x8Wf2r2Mc?t=1790
[SystemFC]: https://youtu.be/06x8Wf2r2Mc?t=2291
