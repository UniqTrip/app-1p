const AvitoParser = require('../controllers/AvitoParser.js');
const AvitoParserV2 = require('../controllers/AvitoParserV2.js');
const AvitoParserV3 = require('../controllers/AvitoParserV3');
const Logger = require('../lib/logger/Logger');

/**
 * обработчик
 */
module.exports.handler_avito = async function(req,res){
  const ObjAvitoParser = new AvitoParser(req,res);

  let result_html;
  let result_rows;
  try{
    result_html = await ObjAvitoParser.requestToGET(`https://www.avito.ru/sochi/avtomobili/peugeot-ASgBAgICAUTgtg2AmSg?cd=1&radius=200`);
    //возвращает массив ссылок на картинки
    result_rows = ObjAvitoParser.parserHandler(result_html);
    //загружает папки в каталог
    await ObjAvitoParser.loadImg(result_rows);

  }catch(err){
    await Logger.writeLog(err, req.custom_path);
    res.end('error');
  }
  //возвращает клиенту строки
  result_rows = JSON.stringify(result_rows);
  res.end(result_rows);
};

/**
 * Парсер обходит по страницам
 * все перебирается в цикле
 */
module.exports.handler_avito_v2 = async function(req,res){
  
  const ObjAvitoParserV2 = new AvitoParserV2(req,res);
  let pagination_html;
  let result_rows;
  
  pagination_html = await ObjAvitoParserV2.requestToGET(`https://www.avito.ru/sochi/avtomobili/peugeot-ASgBAgICAUTgtg2AmSg?cd=1&radius=1000`)
  .catch((err)=>{ console.log(err.message) });
  
  let arr_urls = await ObjAvitoParserV2.parserPaginationV2(pagination_html);
  //console.log(arr_urls);
  await ObjAvitoParserV2.getAllAdvertisements(arr_urls);
  res.end('work');
};


module.exports.handler_avito_v3 = async function(req,res){

  const oAvitoParserV3 = new AvitoParserV3(req,res);

  oAvitoParserV3.test();

};
