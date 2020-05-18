
const fs = require('fs');
const process = require('process');
const express = require('express');
const hbs = require("hbs");
const mysql2 = require('mysql2');
const multer = require('multer');
const redis = require('redis');
const passport = require('passport');
const session = require('express-session'); 
const Model = require('./models/Model');


//запрос обработчиков роутов
const asyncRequest = require('./routes handlers/handler_async_request');
const { handler_avito, handler_avito_v2, handler_avito_v3 } = require('./routes handlers/handler_avito_parsing');
const { main, give_a_picture, creat_article, delete_article } = require('./routes handlers/handler_main');

const { loggin, local, deserializeUser, serializeUser, registration } = require('./routes handlers/handler_access');

const { test, special } = require('./routes handlers/test_handler');

//middlewares
//const middlewares = require('./middleware/middlewares');
const { mid1, authenticationMiddleware, RBACmiddleware } = require('./middleware/middlewares');

const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser'); //требуется в v4 express для passport
//const bodyParser = require('body-parser'); //требуется в v4 express для passport, возможно конфликтует с multer - не конфликтует

//redis для сессий
let RedisStore = require('connect-redis')(session)
//let redisClient = redis.createClient()


const User = require('./lib/User');
const app = express();
const upload = multer({ dest: 'uploads/' });

//npx babel --watch src --out-dir public/js/react_components --presets react-app/prod - рабочий вариант запуска скрипта babel
app.set('view engine', 'hbs');
app.set('views', './views');
hbs.registerPartials(__dirname + "/views/partials");
app.set("view options", { layout: "layout/layout" });
//res.render("home.hbs", {title: "ADMIN", layout: "layouts/admin"});
//app.use(express.static('public'));
app.use('/public', express.static(__dirname + '/public'));
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

app.use(mid1(__dirname));


//пасспотр JS ----------------------------------------------------------------------------------------------------
/**
 * Локальная стратегия по аутентификации пользователя
 */
passport.use('loggin', new LocalStrategy({
  usernameField: 'login',
  passwordField: 'password',
  passReqToCallback: true
}, loggin));

passport.use('registration', new LocalStrategy({
  usernameField: 'login',
  passwordField: 'password',
  passReqToCallback: true
}, registration));

app.use(cookieParser());

app.use(
  session({
    //store: new RedisStore({ client: redisClient }),
    secret: 'mysia-cat',
    cookie: { maxAge: 60000 * 1000 },
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

//роуты
app.get('/', main);


/**
 * Аутентификация
 */
app.post('/login', passport.authenticate('loggin'), (req, res) => {
  console.log('обработчик маршрута login');
  res.redirect('/');
});

/**
 * Регистрация
 */
app.post('/registration', passport.authenticate('registration'), (req, res) => {
  console.log('маршрут регистрациии');
  res.redirect('/');
});

/**
 * выход из системы
 */
app.get('/logout', function (req, res) {
  res.clearCookie('connect.sid',{ path: '/' } )
  req.session.destroy();
  req.logout();
  console.log('вышли из системы');
  res.redirect('/');
});


app.post('/create-article', [authenticationMiddleware, RBACmiddleware('admin'), upload.single('file')], creat_article);

app.post('/delete-article', delete_article);

//запрос к стороннему API с построением очереди асинхронных запросов
app.get('/async-request', asyncRequest.defRender);

app.post('/async-request', asyncRequest.APIrequest);

app.get('/toKLADR', asyncRequest.toKLADR2);


/**
 * тестовый роут
 */
app.get('/test', (req, res)=>{


});


app.post('/special', special);


/**
 * маршрут реализут запрос
 */
app.get('/parseAvito', handler_avito);

app.get('/parseAvitoV2', handler_avito_v2);

app.get('/parseAvitoV3', handler_avito_v3);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


