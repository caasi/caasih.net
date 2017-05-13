[Sending an EOF to a named pipe - Questions](http://fixunix.com/questions/379652-sending-eof-named-pipe.html)

巴龜剛好問到怎麼知道從 pipe 中讀到 EOF 。查了一下才知道只有在所有的 process 中， pipe 的 write 端都被關上時， read 端才會讀到 EOF 。

