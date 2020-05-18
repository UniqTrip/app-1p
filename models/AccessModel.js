const Model = require('./Model');
const crypto = require('crypto');

class AccessModel extends Model {

  async logginMethod(params, callback) {
    const [login, password] = params;
    const sql1 = "SELECT * FROM users LEFT JOIN user_role ON user_role.user_id = users.user_id LEFT JOIN roles ON roles.role_id = user_role.role_id LEFT JOIN role_perm ON role_perm.role_id = roles.role_id LEFT JOIN permissions ON permissions.perm_id = role_perm.perm_id WHERE users.login = ?";

    let result;
    try {
      result = await this.queryAll(sql1, [login]);
      const salt = result[0].password.slice(0, 32);
      let receivedPassHash = await this.hashPassword(password, salt);
      if(receivedPassHash == result[0].password){
        
        let obj = {
          'roles': [],
          'permissions': []
        }
        result.forEach((element, index) => {
          if (index == 0) {
            obj['user_id'] = element.user_id;
            obj['login'] = element.login;
            obj['email'] = element.email;
            obj['password'] = element.password;
          }
          if (!obj['roles'].includes(element.role_name)) {
            obj['roles'].push(element.role_name);
          }
          if (!obj['permissions'].includes(element.perm_desc)) {
            obj['permissions'].push(element.perm_desc);
          }
        });
        return obj;
      }else{
        console.log('парольчики НЕ совпадают');
        return;
      }
    } catch (err) {
      console.log('ошибка метода  logginMethod: ' + err.message);
    }
  }

  async BuildUser(params) {
    const sql1 = "SELECT * FROM users LEFT JOIN user_role ON user_role.user_id = users.user_id LEFT JOIN roles ON roles.role_id = user_role.role_id LEFT JOIN role_perm ON role_perm.role_id = roles.role_id LEFT JOIN permissions ON permissions.perm_id = role_perm.perm_id WHERE users.user_id = ?";

    try {
      let r = await this.queryAll(sql1, params);

      let obj = {
        'roles': [],
        'permissions': []
      }

      r.forEach((element, index) => {
        if (index == 0) {
          obj['user_id'] = element.user_id;
          obj['login'] = element.login;
          obj['email'] = element.email;
          obj['password'] = element.password;
        }
        if (!obj['roles'].includes(element.role_name)) {
          obj['roles'].push(element.role_name);
        }
        if (!obj['permissions'].includes(element.perm_desc)) {
          obj['permissions'].push(element.perm_desc);
        }
      });

      return obj;
    } catch (err) {
      console.log('ошибка метода  deserializeMethod: ');
      console.log(err);
    }

  }

  async registrationMethod(body) {

    let {login, email, password} = body;

    const sql = 'SELECT * FROM users WHERE users.email = ?';

    let result = await this.queryAll(sql, [email]);

    if(result.length != 0){
      console.log('Данный логин или пароль уже занят!');
      console.log(result);
      return;
    }

    let hash = await this.hashPassword(password);
 
    const promisePool = this.pool.promise();
    let connection = await promisePool.getConnection();
    try {
      let sql1 = 'INSERT INTO users(login, password, email) VALUES (?,?,?)';
      let sql2 = 'INSERT INTO user_role (user_id, role_id ) VALUES (?,?)';
      await connection.beginTransaction();
      let result_q = await connection.query(sql1, [login, hash , email ]);
      //индекс новго пользователя
      const last_id = result_q[0].insertId; 
      console.log(`Последний id это - ${last_id}`);
      await connection.query(sql2, [last_id, 1 ]); //по умолчанию роль - 1
      await connection.commit();
      connection.release();
      let user = await this.BuildUser([last_id]);
      return user;
    } catch (e) {
      console.log('ошибка');
      console.log(e.message);
      //console.log(connection)
      await connection.query('ROLLBACK');
      connection.release();
    }

  }

  /**
   * Хэширует пароль, соль длиной 32 символа
   */
  hashPassword(password, saltParam = false) {

    let salt = saltParam ? saltParam : crypto.randomBytes(16).toString('hex');  
    //let salt = crypto.randomBytes(16).toString('hex');

    return new Promise((resolve, reject)=>{

      crypto.pbkdf2(password, salt, 100, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        let hash = derivedKey.toString('hex');
        let result = salt + hash;
        resolve(result);
        return;
      });
    })
  }
}

module.exports = AccessModel;


