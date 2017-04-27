## 智慧乡村
### mongodb 后台运行 ./mongod --fork --dbpath /var/lib/mongodb/ --logpath /var/log/mongodb/mongodb.log --logappend &
```

/etc/redis/redis.conf
默认情况下Redis不作为后台服务运行，这里设置为yes，即可作为后台服务运行
# By default Redis does not run as a daemon. Use 'yes' if you need it.
# Note that Redis will write a pid file in /var/run/redis.pid when daemonized.
daemonize yes

＝＝＝＝＝＝＝＝＝＝＝＝＝
启动redis 服务
redis-server /etc/redis/redis.conf

=====================
检测服务是否已经启动
ps -ef |grep redis
检测6379端口是否监听
netstat -lntp | grep 6379
检测客户端连接是否正常 使用客户端redis-cli

~#:redis-cli
127.0.0.1:6379> keys *
(empty list or set)
127.0.0.1:6379> set key "hello world"
OK
127.0.0.1:6379> get key
"hello world"
```

============
本地启动redis server
/usr/local/bin/redis-server

========
查看端口号进程命令
netstat -nlutp