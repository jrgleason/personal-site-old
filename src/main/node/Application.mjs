import express from 'express';
import path from 'path';
import main from './routes/main.mjs';
import java from './routes/java.mjs';
let __dirname = path.resolve();
class Application{
	constructor(){
	    let app = express();
        app.set('views', path.join(__dirname, 'src/main/node/views'));
        app.set('view engine', 'pug');
        app.use('/', main);
        app.use('/java', java);
        app.use(express.static(path.join(__dirname, 'src/main/node/public')));
        this.app = app;
	}
}
export default Application;