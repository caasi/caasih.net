<iframe width="740" height="555" src="https://www.youtube.com/embed/uR_VzYxvbxg" frameborder="0" allowfullscreen></iframe>

整場演講配上 SPJ 的語調與活力，超歡樂！可惜投影片看不太清楚 XD

本來以為只是介紹 Core 有多精巧，沒想到後面在講 Core optimisations ：

* Inlining
* Rewrite rules
* Beta reduction
* Case of case
* Case of known constructor
* ...

> But once you done this. Very good things happen!

目前我聽得懂的部分中，最讓我驚訝的是把 beta reduction 到 let 的那段。我才剛剛在心中建立起 `let x = expr2 in expr1` 和 `(\x . expr1) expr2` 的關係，沒想到 GHC 反過來做，看到後者就轉成本來就存在 Core 中的前者。也許我在 [Implementing functional languages: a tutorial][IFL] 中也會讀到這樣的應用？

> ... the transformations cascade! meaning you do one thing and that exposes the opportunity for another thing and that exposes the opportunity for another thing ...

另外讓我驚訝的是，這些最佳化彼此相輔相成地。於是會發生先把 beta reduction 變成 let ，再 inline ，或是 case of case 後，再 inline ... 一直做下去。

雖然最後指出和這主題相關的論文還有二三十篇（這輩子看得完嗎？），像是 [Secrets of the GHC inliner][inliner] ，但這充滿感染力的演講一掃週一夜晚的煩悶。我錯了，如果可以的話，真想成為這樣帶來知識和歡笑的人 XD

演講尾聲時還提到：

> ... compile strict language and lazy language into the same thing.

猜就算幾年後再重聽，一定還會從中學到東西。

[IFL]: http://research.microsoft.com/en-us/um/people/simonpj/Papers/pj-lester-book/
[inliner]: https://ghc.haskell.org/trac/ghc/wiki/Inlining
