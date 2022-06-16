# calliope-server

server application for calliope

### Setup

```
docker-compose -f docker-compose.dev.yml up -d --build
```

### Development

```bash
$ cd services/webapi/server
$ npm i --no-fund --no-audit
$ npm run dev
$ open http://localhost:7003/
```

### Deploy

```bash
$ npm start
$ npm stop
```