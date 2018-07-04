跟 `UITableView` 很不熟，也處得很不好。

最麻煩的是，如果要動態改變 `UITableViewCell` 的高度，得經由 `TableView` 的 `-beginUpdates` 讓它自己去問 `-tableView:heightForRowAtIndexPath:` ，而且在其中無法取得現在正在用的 `UITableViewCell` ，於是只好先把高度，或是有沒有被選起來，存在別的地方，而不是跟 `UITableViewCell` 放在一起。

更糟的是 `-tableView:heightForRowAtIndexPath:` 有效率問題。可是 `UITableView` 是呈現資料最方便的 View ，自然希望它更方便做各種變化。

要怎樣跟他變成好朋友？

