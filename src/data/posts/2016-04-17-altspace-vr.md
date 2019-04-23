[AltspaceVR][AltspaceVR] 實在是個很奇怪的地方。可以一起看 YouTube 這點，讓我想起消失很久的 [Google Lively][Lively] ，在那裡有個小房間、當隻小豬也甘願。

[AltspaceVR]: http://altvr.com/
[Lively]: https://en.wikipedia.org/wiki/Google_Lively

不幸的是，現在 Rift DK2 和 HTC Vive 正夯，沒有人理 DK1 ，如果不幸跟我一樣只有 DK1 ，那在 OSX 下需要做兩件事才能進入 Altspace ：

* 取消「鏡像顯示器」：不然滑鼠無法點選任何選單
* 使用以下的[指令][gist:1a9ff84927cf9e9654c2]打開 RiftConficUtil ，關閉健康警告：

```
# Run this in shell
# Then create/load user profile, click "Advanced..." and tick "Disable Warning"
Oculus_LibOVR_HSWToggleEnabled=1 /Applications/Oculus/Tools/RiftConfigUtil.app/Contents/MacOS/RiftConfigUtil
```
  
[gist:1a9ff84927cf9e9654c2]: https://gist.github.com/LeZuse/1a9ff84927cf9e9654c2
