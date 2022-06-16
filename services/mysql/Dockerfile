FROM mysql:5.7
COPY ./my.cnf /etc/mysql/conf.d/mysqlutf8.cnf
CMD ["mysqld", "--character-set-server=utf8", "--collation-server=utf8_unicode_ci"]
COPY ./initdb.d /docker-entrypoint-initdb.d