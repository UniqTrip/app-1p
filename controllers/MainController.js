
const Controller = require('./Controller');
const MainModel = require('../models/MainModel');
const fs = require('fs');
const fsPromises = fs.promises;

class MainController extends Controller {

  constructor(req, res) {
    super();
    this.req = req;
    this.res = res;
  }

  /**
   * Получить статьи из базы данных 
   */
  async getArticles() {

    //обработать входящие данные
    const oModel = new MainModel(this.req, this.res);
    return await oModel.getArticleData();
  }

  /**
   * отдает большую картинку клиенту
   */
  giveAPicture() {

    this.res.on('finish', () => {
      console.log('Событие finish потока res');
    })

    this.res.on('error', (err) => {
      console.log('Событие error потока res');
    });

    const path = `${this.req.custom_path}\\img\\15827236333180.jpg`;
    this.res.setHeader('Content-Disposition', 'attachment; filename="15827236333180.jpg"');
    this.res.setHeader('Content-Type', 'application/octet-stream');

    const read_file = fs.createReadStream(path);

    read_file.on('close', () => {
      console.log('поток чтения фала read_file вызвал close');
    });

    read_file.on('end', () => {
      this.res.end();
      console.log('поток чтения фала read_file вызвал end');
    });

    read_file.on('error', (err) => {
      console.log('Событие error потока read_file')
    });

    read_file.pipe(this.res);

  }

  /**
   * создать случайную статью из данных полученных парсингом, и файла загруженного клиентом
   */
  async creatArticle() {
    const oModel = new MainModel(this.req, this.res);
    //загружаемый пользователем файл
    const filename = this.req.file.filename;

    let part1 = filename.slice(0, 1);
    let part2 = filename.slice(1, 2);
    let part3 = filename.slice(2, 3);

    let root = `${this.req.custom_path}\\public\\imgs`;
    let path = `${root}\\${part1}\\${part2}\\${part3}\\${filename}.jpg`;
    //создал каталоги полученные из хэша имени загруженного файла
    try {
      await oModel.checkDir(`${root}\\${part1}`);
      await oModel.checkDir(`${root}\\${part1}\\${part2}`);
      await oModel.checkDir(`${root}\\${part1}\\${part2}\\${part3}`);
    } catch (e) {
      console.log(e);
    }

    //перезаписать из временной папки в постоянную, и удалить из веременной
    const pathUpload = `${this.req.custom_path}\\${this.req.file.path}`;
    const pathPublic = path;

    try {
      await new Promise((resolve, reject) => {

        const readFile = fs.createReadStream(pathUpload);

        readFile.on('error', (err) => {
          console.log(err);
          reject();
        })

        readFile.on('end', () => {
          //console.log('событие end потока readFile');
        });

        const writeFile = fs.createWriteStream(pathPublic);

        writeFile.on('error', (err) => {
          console.log(err);
          reject();
        })

        writeFile.on('finish', () => {
          //console.log('событие finish потока writeFile');
          //удаляю файл загруженный пользователем из временной папки
          fs.unlink(pathUpload, (err) => {
            if (err) throw err;
            //console.log('pathUpload was deleted');
            resolve();
          });
        })

        readFile.pipe(writeFile);

      });
    } catch (error) {
      console.log(error.message);
    }

    //добавить новый адрес к пакету выбранных случайно из каталогов общих -  к уже обработанным с url для тега img
    //просканировать каталоги выбрать случайный каталог
    //получение рандомных картинок/ их запись в каталог public/imgs / создание массива ссылок на картинки для записи в файлы 
    const img_arr = await oModel.scanRandom();

    //сохранить картинки в imgs под новыми именами
    const arr_imgs_src = await oModel.createArticle(img_arr);

    arr_imgs_src.push(path);
    //сохранение "статьи" в БД
    await oModel.saveArticle(arr_imgs_src, this.req.body.id);
    //картинки переносятся в базу, описание в текст возможно перенести в каталог для базы  
    this.res.end('end');
  }

  /**
   * удаляет отдельную статью
   */
  async deleteArticle(){
    const id  = this.req.body.id;
    const oModel = new MainModel(this.req, this.res);
    
    await oModel.deleteArticle(id);
    this.res.setHeader('Content-Type', "application/json");
    let obj = {id : true};
    obj = JSON.stringify(obj);
    this.res.end(obj);
  }

} 

module.exports = MainController;