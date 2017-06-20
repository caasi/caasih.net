[[Steam] Implement GLSL 1.30 (for older chipsets than SandyBridge)](https://bugs.freedesktop.org/show_bug.cgi?id=59187)

Intel Gen4 顯卡很鳥蛋已經不是新聞了。之前在低階 Mac mini 上跑 Frespace 2 就遇過編譯 GLSL 出狀況，沒想到現在裝 Steam for Linux 又遇到一次。

循線一路查，才知道現在 Intel [有地方](https://01.org/linuxgraphics/)專門處理 open source driver 。問題出在 Intel Gen4 顯卡驅動只支援到 GLSL 1.20 ，而 source engine 需要一些 GLSL 1.30 的功能。

另外此 issue 的討論也[點出](https://bugs.freedesktop.org/show_bug.cgi?id=59187#c8)， Intel 舊顯卡有個硬體上的問題，需要靠軟體來補足。

高興的是，這問題一直到昨天（ 25 號），都有人關心，也許能看到修正的一天也說不定。

EDIT: 原 issue 標題改了。

