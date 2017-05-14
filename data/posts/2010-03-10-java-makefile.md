```
# compiler and path setting
JAVA = /usr/bin/java
JC = /usr/bin/javac
JFLAGS = -g
CP = ./classes
SRC = ./src

# put your main class and other classes here
MAIN = \
        FirstWindow.java

CLASSES = \

# rules
default: classes

$(CP)/%.class:$(SRC)/%.java
        $(JC) $(JFLAGS) -sourcepath $(SRC) -d $(CP) $&lt;

classes: $(addprefix $(CP)/, $(MAIN:.java=.class)) $(addprefix $(CP)/, $(CLASSES:.java=.class))run: $(addprefix $(SRC)/, $(MAIN)) $(addprefix $(SRC)/, $(CLASSES))
        $(JAVA) -cp $(CP) $(MAIN:.java=)

clean:
        $(RM) $(CP)/*.class
```

習慣把 .class 跟 .java 分開放，網上找到的 Java makefile 不是很好用。

最後，這個學期還是修了視窗程式設計（Java Swing），雖然已經試過 Windows API 跟 Qt ，到現在才算是真的以了解 component 為目的學視窗。畢竟到頭來在 Flash 上面總有一天還是得會寫自己的 ui component 。

<p>Amao則是自己在碰 GTK，不知道 GTK怎麼傳遞事件？</p>
