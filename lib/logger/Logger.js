const fs = require('fs');

/**
 * класс логгирующий данные 
 */
class Logger{
  
  static async writeLog(error, path_root){
    let {message, fileName} = error;  
    let data = `Дата: ${new Date().toLocaleString()}.\nСообщение ошибки: ${message}, файл в котором ошибка произошла: ${fileName}\n----------------------------------\n`;
    let file = `${path_root}\\log\\log.txt`;
    return new Promise((resolve, reject)=>{
      fs.writeFile(file,data,{encoding:'utf-8', flag : 'a+' },(err)=>{
        if(err){
          reject(err);
          return;
        };
        resolve();
      });
    });      
  }
}

module.exports = Logger;