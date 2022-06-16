FROM logstash:7.6.2

RUN rm -rf /usr/share/logstash/pipeline
COPY pipeline /usr/share/logstash/pipeline
COPY mysql-connector-java-8.0.17.jar /usr/share/logstash/mysql-connector-java-8.0.17.jar