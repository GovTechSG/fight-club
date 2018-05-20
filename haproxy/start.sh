#!/bin/sh -ex
/sbin/syslogd -O /proc/1/fd/1   # <--- link to docker's stdout, not "your stdout"
haproxy -f /usr/local/etc/haproxy/haproxy.cfg -db  # <--- stay in foreground

