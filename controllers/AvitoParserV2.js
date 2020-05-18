const https = require('https');
const fs = require('fs');
//const url = require('url');
const path = require('path');
const cheerio = require('cheerio');
const querystring = require('querystring');
const Controller = require('./Controller');

class AvitoParserV2 extends Controller {
  constructor(req, res) {
    super(req, res)
    this.req = req;
    this.res = res;
  }

	/**
   * Парсер html v.2
   * @param {*} html 
   */
  async parserPaginationV2(html) {
    let $ = cheerio.load(html);
    let str = $('.pagination-hidden-3jtv4 .pagination-pages a').last().attr('href');
    let max_page = + str.match(/\?p=([0-9]+)/)[1];

    let promise_arr = [];
    let root = this.req.custom_path;

    for(let i = 1; i <= max_page; i++){
      let url = `https://www.avito.ru/sochi/avtomobili/peugeot-ASgBAgICAUTgtg2AmSg?p=${i}&cd=1&radius=1000`;
      let promise = new Promise((resolve, reject) => {
        let file = `${root}\\file\\advertisements_info\\file${i}`;
        fs.mkdir(file, { recursive: true }, (err) => {
          if (err) {
            let e = new Error('Ошибка создания каталога для хранения данных с авито');
            reject(e);
            return;
          }
          resolve([url, file])
        });
      });
      promise_arr.push(promise);
    };

    return Promise.all(promise_arr);

  }

  async parseAdvertisements(html, file, parent_index) {
    let $ = cheerio.load(html);
    let f = `${file}\\test.txt`;
    let advertisements = $('.index-root-2c0gs .js-catalog_serp div[class=item__line]');
    let text_data = '';
    advertisements.each((index, element) => {
      let text = $(element).find('.description').text();
      text = text.replace(/\s/ig, '');
      text_data += `Индекс:${index}. Данные:${text}\n`;
    });

    return  new Promise((resolve, reject)=>{
      fs.writeFile(f, `Родительский индекс:${parent_index}.Данные:\n ${text_data}`, { flag: 'a' }, (err) => {
        if (err) {
          console.log(err.message);
          reject(err.message);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Передает url-ссылку пагинации, передал путь к файлу для записи 
   * @param {*} arr_urls  
   */
  async getAllAdvertisements(arr_urls) {

    let promises = [];

    arr_urls.forEach(async (element, index) => {

      let elem = element[0];
      let file = element[1];

      let promise = new Promise(async(resolve, reject)=>{
        let html = await this.requestToGET(elem);
        await this.parseAdvertisements(html, file, index);  
        resolve();
      });

      promises.push(promise);

    });
    return Promise.all(promises);
  }

}

module.exports = AvitoParserV2;