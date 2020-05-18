const https = require('https');
const fs = require('fs');
//const url = require('url');
const path = require('path');
const cheerio = require('cheerio');
const querystring = require('querystring');
const Controller = require('./Controller');

class AvitoParser extends Controller {

  constructor(req, res) {
    super(req, res)
    this.req = req;
    this.res = res;
  }

  /**
   * Разбор парсером основной страницы html c авито
   * Вызывается в обработчике handler_avito
   */
  parserHandler(html) {
    let $ = cheerio.load(html);


    let n = $('.index-root-2c0gs .js-catalog_serp');
    let childs = n.children().slice(1, 7);
    let arr = {};

    childs.each((index, elem) => {

      // ссылка на авто
      let link_auto = $(elem).find('a').eq(0).attr('href');
      if (link_auto == undefined) { return };
      arr[link_auto] = [];

      //получить все ссылки на фото авто
      let img_arr = $(elem).find('div a ul li img').slice(1, 5);

      console.log(img_arr);

      //if(img_arr.length == 0){ return };

      img_arr.each((i, elem1) => {
        if (elem1.name != 'img') { return };
        //console.log(index);
        let val = $(elem1).attr('src');
        arr[link_auto].push(val);
        //console.log(`${elem1.name} src: ${val}`);
      })
    });
    return arr;
  }

  /**
   * Загрузить картинки в каталог, для каждой машины - отдельная папка
   *    * @param {*} arr //массив ссылок на каринки 
   */
  async loadImg(arr_src_img) {
    
    let promise_arr = [];

    for (let key in arr_src_img) {

      let elem = arr_src_img[key];
      //создать в этой директории файл загружаемой картиинки с именем из ссылки
      let root = this.req.custom_path;
      let imgs_dir = `${root}\\file\\uploaded_images\\${key.replace(/\//gi, '_')}`;

      let asyncLoader = async () => {

        try {
          await new Promise((resolve, reject) => {
            fs.mkdir(imgs_dir, { recursive: true }, (err) => {
              if (err) {
                reject(err)
                return;
              };
              resolve()
            });
          });
        } catch (err) {
          console.log('ошибка создания каталогов');
          //обработать ошибку создания каталога
          //reject для Promise.All()
          return;
        }

        //тут отловить все промисы с помощью promise all
        let sub_promise_arr = [];

        elem.forEach((img) => {

          let oUrl = new URL(img);

          let opt = {
            hostname: oUrl.hostname,
            path: oUrl.pathname,
            method: 'GET'
          };
          
          let basename = path.basename(img);
          let write_path = `${imgs_dir}\\${basename}`;

          let write_stream = fs.createWriteStream(write_path, {flags:'a+', encoding:'binary' });

          write_stream.on('error',()=>{
            console.log(error);
          })

          let promise = new Promise((resolve, reject) => {
            let req = https.request(opt, (response) => {
              response.setEncoding('binary');
              //загрузка файла
              //let img_bin = '';
              response.pipe(write_stream);
              // response.on('data', (data)=>{
              //   img_bin += data;
              // })
              response.on('end',()=>{
                console.log(`Файл-${basename} записан в директорию - ${write_path}`);
                resolve();
              });

              response.on('error',(err)=>{
                reject(err.message);
              })

            })

            req.on('error', (e) => {
              console.error(e);
              reject(e.message);
            });

            req.end()
          });

          sub_promise_arr.push(promise);
        });

        return Promise.all(sub_promise_arr);

      }
      promise_arr.push(asyncLoader());
    }
    return Promise.all(promise_arr);
  }

}

module.exports = AvitoParser;