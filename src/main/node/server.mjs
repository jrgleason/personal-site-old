import Application from "./Application.mjs";
import http from "http";
import https from "https";
import path from 'path';
import fs from 'fs';
let __dirname = path.resolve();
let express = new Application();
// TODO: Normailize port
express.app.set("port", '3000');
let server = http.createServer(express.app);
server.listen("3000");
let secure = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'src/main/node/key/server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'src/main/node/key/server.cert'))
},express.app);
secure.listen("3001");
let onListening = function(){
  let addr = server.address();
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
}
server.on('listening', onListening);
secure.on('listening', onListening);