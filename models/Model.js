const mysql2 = require('mysql2');

const pool = mysql2.createPool({
	connectionLimit: 10,
	host: 'localhost',
	user: 'mysql',
	password: 'mysql',
	database: 'nodejs_app_1'
});

class Model {

	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.pool = pool;
	}

	query(sql, params = []) {

		return new Promise((resolve, reject) => {
			this.pool.getConnection((err, conn) => {
				if (err) {
					reject(err.message);
					return;
				}

				conn.execute(sql, params, (err, result, fields) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(result);
				});

				this.pool.releaseConnection(conn);
			});
		});
	}

	queryAll(sql, params = []) {

		return new Promise((resolve, reject) => {

			this.pool.getConnection((err, conn) => {

				if (err) {
					reject(err.message);
					return;
				}

				conn.execute(sql, params, (err, result, fields) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(result);
					this.pool.releaseConnection(conn);
				})

				//this.pool.releaseConnection(conn);
			})
		})
	}

}

module.exports = Model;


/**
	 * тест
	 */
function test() {
	console.log('Запуск соединения с базой');

	this.pool.getConnection(async (err, conn) => {
		if (err) console.log(err.message);
		// Do something with the connection
		conn.execute("SELECT * FROM articles WHERE articles.id = ?", [1], (err, result, fields) => {
			if (err) {
				console.log('ошибка запроса в базу');
				console.log(err.message);
				return;
			}
			console.log(result);
			// Don't forget to release the connection when finished!
			this.pool.releaseConnection(conn);
		});
	})
	console.log('соединение выполнено');
}

/**
 * тест промис
 */
async function testPromise() {

	const promisePool = this.pool.promise();

	let result = await promisePool.execute("SELECT * FROM articles WHERE articles.id = ?", [2]);

	console.log(result[0]);
}

/**
 * тест промис транзакция
 */
async function transactionTest() {

	const promisePool = this.pool.promise();
	let connection = await promisePool.getConnection();
	try {
		await connection.beginTransaction();
		await connection.query('INSERT INTO articles ( id_user, text ) VALUE (?,?)', [1, 'test1']);
		await connection.query('INSERT INTO articles ( id_user, text ) VALUE (?, ?,?)', [1, 2, 'test2']);
		await connection.commit();
		connection.release();

	} catch (e) {
		console.log('ошибка');
		console.log(e.message);
		//console.log(connection)
		await connection.query('ROLLBACK');
		connection.release();
	}

}