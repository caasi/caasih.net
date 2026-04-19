Ilya 前年介紹了 Matthew Fuller 在 caa-ins 上的一場，有關數據結構與空間結構的演講。那時沒辦法到場聽，但最近發現有[錄影與逐字稿][caa-ins-1213]。


開場就引用 Kurt Gödel 的不完備定理，接著說明編碼、轉譯、解碼這樣的過程，在我們的社會、文化中隨處可見。將各種程式語言的表現方式視為紋理、物料，好像混凝土、陶土那樣，有各自的特質和使用方式。這點有很有意思。

但我不懂，拿 [Gödel numbering][goedel-numbering] 來類比之後所有的編碼、解碼方式，是不是有點牽強？

Gödel 編碼的是一個公理系統中的命題，雖然最後以自然數來表現，但不會用到所有自然數的性質，目的是用它來完成證明。而後面提到的編碼、解碼（例如 Shannon 在訊息理論上的工作）牽扯到的是把自然界連續的訊號轉換成數位訊號，還要面對資訊損失。

我覺得編碼是人類拆分一個系統，試著去了解該系統的方法。例如有些程式語言的型別系統，表達能力比較強，所以用它描述要處理的資料時，可以設下較多限制，避免在轉譯成其他編碼時出錯。有些比較弱，但在趕著開發程式時，限制比較少。

最近聽到一種反思，讓我好奇「這反映的是人類自身的結構，還是世界的結構？」。（例如 Bartosz Milewski 在他的 category theory 課程 37:22 提到的）

<iframe width="560" height="315" src="https://www.youtube.com/embed/I8LbkfSSR58" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

如果這反映的是人類自己的結構，那麼 array, list, table, matrix, stack, heap 這些資料結構，它們的命名雖然有空間隱喻，表示的其實是人類用對空間的經驗來識別這些資料結構。它們是人類經驗延伸出來的抽象，城市的結構（也是人類的延伸）中本來就包含它們，而不是分開的、需要結合的兩種東西。

[caa-ins-1213]: http://caa-ins.org/archives/1213
[goedel-numbering]: https://en.wikipedia.org/wiki/G%C3%B6del_numbering
