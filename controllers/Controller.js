const url = require('url');
const querystring = require('querystring');
const https  = require('https');

const Client = require('../lib/sessions/client.js');
const Session = require('../lib/sessions/session');
const Restore = require('../lib/sessions/storage.js');
const User = require('../lib/User');

class Controller {
  
  constructor(req,res) {
    this.req = req;
    this.res = res;
  }

  mainPage(req, res, layout) {

    res.render(layout);
  }

  async getSession(req,res){
    let client = await Client.getInstance(req,res);
    console.log(client.session);
    Session.start(client);
    client.sendCookie();
    this.mainPage(req, res, 'blog.hbs')
    //return(client);
  }

  async updateSession(req,res){
    let client = await Client.getInstance(req,res);

    //client.session.save();
  }

  async saveSession(req,res){
    let client = await Client.getInstance(req,res);
    
    client.session.save();
  }

  async getUser(req,res){
    const user = new User();
    let client = await Client.getInstance(req,res);
    Session.start(client);
    client.sendCookie();
    await user.init();
    return user;
  }

  
  /**
   * Запрос POST https 
   */
  async requestToPOST(url = '', data = {} ,...args){

    const myURL =  new URL(`https://www.avito.ru/sochi/avtomobili/peugeot?cd=1&radius=100`);

    let post_data = querystring.stringify(data);

    const opt = {
      hostname: 'meteoinfo.ru',
      port: 443,
      path: '/hmc-output/forecast/tab_1.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve, reject) => {


      const reqhttp = https.request(opt, (response) => {

        let data = '';

        response.on('data', (d) => {
          data += d;
        });

        response.on('end', () => {
          resolve(data);
        });

        response.on('error', (error) => {
          reject(error.message);
        })

        response.on('close', () => {
          console.log('событие close ответа запроса request к сайту meteodata ');
        })
      });

      reqhttp.on('error', (err)=>{
        console.log('ошибка reqhttp');
        console.log(err.message);
        let my_err = new Error('Кастомная ошибка');
        reject(my_err);
      });

      reqhttp.write(post_data);
      reqhttp.end();
    });
  }

  async requestToGET(url, ...args ){

    return new Promise((resolve, reject)=>{
      
      https.get(url, (res)=>{
        let html = '';
        
        res.on('data', (data)=>{
          html += data;
        });

        res.on('end', ()=>{
          resolve(html);
        });

        res.on('error', (err)=>{
          console.log('ошибка res ответа от авито');
        });

      }).on('error', (err)=>{

        //вопрос обработки ошибок
        const myErr = new Error(`Ошибка GET запроса к авито. Данные ошибки - ${err.message}`);
        reject(myErr);
      });

    });
    
  }

}


module.exports = Controller;