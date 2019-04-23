法蘭克福書展後，公司似乎不那麼忙亂，但我的心態卻有了變化。

先別急著吐槽：「你也放棄得太快了吧？」或是「就知道會這樣。」

並不覺得對不起這份工作，雖然沒有忙到像天天 hackathon ，但在台北的日子，能不被打擾想著公事。這也是來之前的初衷，要像桐山零（或按訪談的說法，就是作者羽海野チカ本人）看齊，不讓自己有藉口抱怨：「要是當時再拼一點就好了。」

喜歡 GitHub 這種看得到 source ，東西壞掉時找得到 issue 或是 pull request ，對這個問題什麼時候會修，或有沒有人在意有個底。加上在 #g0v.tw 頻道看到的合作模式，讓我對無法存取的檔案庫，或是會影響到自己，但是無法得知的訊息感冒（還不如一開始就不知道），不方便嘗試新想法。

說到新想法，之前太拘泥於簡報檔了。看看未來的需求，如果書裡的每個資源，都有獨立的 URI ，就能方便地ç´錄讀者可以使用那些資源。網頁版的閱讀器與其試著去解析 EPUB 或其他私有格式，不如從 API 取得資源，把書組出來。

那時才有空實驗這個想法？該撥空用 [Apiary](http://apiary.io/) 先做？反正工具都在，沒道理不用。行不行得通，做過才知道。

---

十一月底又有另外一條死線（The American Council on the Teaching of Foreign Languages, ACTFL），當然希望可以快點完成更多書，這幾天一直在整理做到一半的工具。

才知道許多細節妳在兩個月前幾乎都做過了！要不是有這些 code 可以參考，真不知自己得走多少彎路？

目前的方向是打算在 zip 前，把資料都複製到個別資料夾，再產生頁面跟打包用的 metadata 。沒用 `make` 是因為不熟悉除了生出額外的檔案外，有沒有更好的溝通方式。沒用 [gulp](https://www.npmjs.org/package/gulp) 則是因為 [vinyl-fs](https://www.npmjs.org/package/vinyl-fs) 有個[遇到 symbolic link 會出 EISDIR 的 issue](https://github.com/wearefractal/vinyl-fs/issues/39) 。修好前，沒法像原來那樣，做 symbolic link 再打包。正在用的 [xmlbuilder](https://www.npmjs.org/package/xmlbuilder) 很友善，但也許以 [jade](https://www.npmjs.org/package/jade) 提供頁面與 ocf 的 template ，管理起來會更方便。

---

就算這樣，只是兜出能動的東西而已。我還是不了解該注意什麼，還有它們代表什麼意義。

從 Open Container Format 輾轉找到[汪達數位講的故事](http://wanderer.tw/post/34139362832/recyclebookstore-in-2032-2)，發現 [Extended Books](http://en.wikipedia.org/wiki/Expanded_Books) （又看到 HyperCard ），想起 [Accuracy takes power: one man’s 3GHz quest to build a perfect SNES emulator](http://arstechnica.com/gaming/2011/08/accuracy-takes-power-one-mans-3ghz-quest-to-build-a-perfect-snes-emulator/) ，為了完美模擬超任，得花那麼多工夫，還好 EPUB 是個開放的標準。

但我有好好利用這個標準嗎？ HTML5 可以做的事情太多，我忽略了早已存在的 SMIL 技術。到今天才知道閱讀器正嘗試支援它，還內建了個可愛的按鈕，又能自動翻頁。知道得少，想像力也被侷限，除了靠 React 呈現 VTT ，我還可以有不同選擇 XD
