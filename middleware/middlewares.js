/**
 * Классы сессий
 */
const Client = require('../lib/sessions/client');
const Session = require('../lib/sessions/session');
// const Restore = require('./lib/sessions/storage.js');

module.exports.mid1 = (path)=>{
  return (req, res, next)=>{
    req.custom_path = path;
    next();
  }
}

//сессии
module.exports.sessions = async function(req,res,next){

  // let client = await Client.getInstance(req,res);
  // Session.start(client);
  // client.session.save();
  // client.sendCookie();
  //console.log( 'клиентская сессия: ' + client.session);
  next();
}

/**
 * мидлвэйр проверки аутентификации маршрута 
 */
module.exports.authenticationMiddleware = (req, res, next)=>{
  if (req.isAuthenticated()) {
    console.log('миддлвэйр аутентификации');
    return next()
  }
  console.log('доступ воспрещен');
  res.redirect('/')
}


module.exports.RBACmiddleware = (role) =>{
  return function(req, res, next){
    if(req.user.roles.includes(role)){
      //console.log('Доступ к действию получен. Роли совпадают!');
      next();
      return;
    }
    console.log('Нет прав!');
  }
}