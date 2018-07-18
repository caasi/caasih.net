# Dokku

## 安裝

clone Dokku：

```shell
git clone git@github.com:progrium/dokku.git
```

不要使用 `bootstrap.sh` ：

```shell
sudo apt-get update
sudo agt-get install -qq -y git make curl software-properties-common man-db help2man
sudo make install CI=true
```

其中 `CI=true` 是為了迴避掉檢查 aufs 的段落。

## 設定

修改 `/etc/sudoers` ，請參考 [HowTO: Sudoers Configuration](http://ubuntuforums.org/showthread.php?t=1132821) ：

```
# Allow members of group sudo to execute any command
%sudo   ALL=(ALL) ALL
%sudo   ALL=(ALL) NOPASSWD:/usr/local/bin/sshcommand
```

這樣使用 `sshcommand` 指令時就不用輸入密碼。遠端以 `ssh` 執行時 `acl-add` 時也不會出現沒有 tty 這類錯誤。

讓使用者可以以 `git push` deploy 專案，詳見 [Advanced installation](http://progrium.viewdocs.io/dokku/advanced-installation) ：

```shell
cat ~/.ssh/id_rsa.pub | ssh dokku.me "sudo sshcommand acl-add dokku $USER"
```

按 linode 官方教學，[修改 hostname](https://www.linode.com/docs/getting-started) ，修改 `~dokku/VHOST` 和 `~dokku/HOSTNAME` ，然後重新啟動 linode 。

