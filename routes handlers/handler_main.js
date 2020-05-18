const fs = require('fs');

const MainController = require('../controllers/MainController');

/**
 * получает html с авито, 
 */
module.exports.main = async (req, res) => {

  console.log('---объект coockie:');
  console.log(req.cookies);

  console.log('---объект session:');
  console.log(req.session);
  
  console.log('---объект user:');
  console.log(req.user);

  const oMainController = new MainController(req,res);
  try{
    const data  = await oMainController.getArticles();
    //const userPermisions = req.user;
    function Foo(t){
      
      if( !req.user){
        return false;
      }

      if(req.user.permissions.includes(t)){
        return true;
      }
      return false;
      }

    res.render('main.hbs', {data: data, foo : Foo('click') });
  }catch(e){

    console.log('ошибка соединения с базой');
    console.log(e);
    res.end('data base error');
    return;
  }

}

/**
 * Отдает клиенту картинку
 */
module.exports.give_a_picture = (req, res) => {

  const oMainController = new MainController(req,res);
  oMainController.giveAPicture();

}

/**
 * Генерирует случайную статью
 */
module.exports.creat_article = async (req, res)=>{

  const oMainController = new MainController(req,res);

  await oMainController.creatArticle();

}

/**
 * удаляет статью
 */
module.exports.delete_article = async (req, res)=>{
  const oMainController = new MainController(req,res);
  await oMainController.deleteArticle();
}
