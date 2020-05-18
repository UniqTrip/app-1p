const AccessModel = require('../models/AccessModel');

/**
 * Локальная стратегия по аутентификации пользователя
 */
module.exports.loggin = async (req, login, password, done) => {
  console.log('стратегия по аутентификации пользователя исполненена');
  const oModel = new AccessModel;
  let params = [
    login,
    password
  ];
  let user = await oModel.logginMethod(params);
  req.session.user = user;
  done(null, user);
}

/**
 * Локальная стратегия по регистрации пользователя
 */
module.exports.registration  = async(req, login, password, done)=>{
  //валидация входящих данных

  //запрос к базе - проверка на уже существующего пользователя
  const oModel = new AccessModel;
  const user = await oModel.registrationMethod(req.body);
  done(null, user);
}


/**
 * сереализация пользователя
 */
module.exports.serializeUser = async (user, done)=>{
  console.log('данные сереализуются');
  done(null, user.user_id);
}

/**
 * десереализация пользователя
 */
module.exports.deserializeUser = async (request, id, done) =>{
  console.log(`Десериализующиеся данные`);
  const oModel = new AccessModel;
  //const user = await oModel.BuildUser([id]);
  const user = request.session.user;
  done(null, user);

}

