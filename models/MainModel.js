
const Model = require('./Model');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


class MainModel extends Model {

	constructor(req, res) {
		super(req, res);
	}

	/**
	 * получить набор случайных картинок из разных каталогов
	 */
	async scanRandom() {

		//получить шесть рандомных картинок из разных каталогов

		let catalog = `${this.req.custom_path}\\file\\validatorv3`;

		async function rec(catalog) {
			let promise = await new Promise((resolve1, reject1) => {

				fs.readdir(catalog, {}, async (err, files) => {
					//console.log(files);
					if (err) {
						return err;
						//reject1();
					}

					if (files.length == 0) {
						//--->если каталог пуст - то это не верная попытка, еще раз выполнить случайную выборку!
						console.log('Директория пуста');
						return;
					}
					const filesArr = [];
					const dirArr = [];
					let promises = [];

					files.forEach((elem, index) => {

						let promise = new Promise((resolve, reject) => {
							let file = `${catalog}\\${elem}`;
							fs.lstat(file, {}, (err, stats) => {
								if (err) {
									reject();
									return;
								}

								if (stats.isFile()) {
									filesArr.push(file);
									//return;
								}
								if (stats.isDirectory()) {
									dirArr.push(file);
									//return;
								}
								resolve();
							})
						});
						promises.push(promise);
					});

					await Promise.all(promises).catch(err => console.log(err));

					//если в папке есть каталоги - выбрать случайный каталог и перейти в него
					if (!dirArr.length == 0) {
						//выбрать случайный элемент из массива каталогов
						let randomFolder = dirArr[Math.floor(Math.random() * (dirArr.length))];
						//рекурсивный вызов rec()
						resolve1(rec(randomFolder));
					}

					//если в папке нет каталогов - выбрать один случайный файл - только картинку
					if (dirArr.length == 0) {
						//выбрать случайный элемент
						//--->если выбранный случайный элемент - не картинка - из этой же выборки выбрать другой
						let randomFile = filesArr[Math.floor(Math.random() * (filesArr.length))];

						while (path.extname(randomFile) == '.txt') {
							randomFile = filesArr[Math.floor(Math.random() * (filesArr.length))];
						}
						return resolve1(randomFile);
					}

				});
			});
			return promise;
		};

		const img_arr = [];
		for (let i = 0; i < 10; i++) {

			let result = await rec(catalog).catch(err => { console.log(err) });
			img_arr.push(result);
		}
		return img_arr;
	}


	/**
	 * Создание "статьи" из рандомных картинок
	 * Взять хэш от картинок, сохранить картинки в каталог public\imgs
	 * -- делать пагинацию!
	 * возвращает массив url
	 */
	async createArticle(img_arr) {

		//let md5sum = crypto.createHash('md5');
		//хэш из названия
		// let hashImgName = img_arr.map((elem, index) => {
		// 	let name = path.basename(elem, '.img');
		// 	let hash = crypto.createHash('md5').update(name).digest('hex');
		// 	//return md5sum.update(elem).digest('hex');
		// 	return [elem, hash];
		// });

		//получить массив хэшей из файлов 
		let result_hash = await new Promise((resolve, reject) => {

			let promise_arr = [];

			img_arr.forEach((elem, index) => {

				let promise = new Promise((resolve, reject) => {

					let shasum = crypto.createHash('md5');
					let readFile = fs.ReadStream(elem);

					readFile.on('data', (data) => {
						shasum.update(data);
					});

					readFile.on('error', (err) => { console.log(err) });

					readFile.on('end', () => {
						let hash = shasum.digest('hex');
						resolve([elem, hash]);
					})
				});

				promise_arr.push(promise);

			});

			Promise.all(promise_arr)
				.then((result) => {
					resolve(result);
				})
				.catch((err) => {
					reject(err);
				});

		});

		let promise_arr = [];
		//записать в каталоги
		result_hash.forEach((elem, index) => {

			let original_item = elem[0];
			let hash = elem[1];

			let root = `${this.req.custom_path}\\public\\imgs`;

			let promise = new Promise(async (resolve_top, reject) => {

				//получить первые 3 символа
				let part1 = hash.slice(0, 1);
				let part2 = hash.slice(1, 2);
				let part3 = hash.slice(2, 3);

				let path = `${root}\\${part1}\\${part2}\\${part3}\\${hash}.jpg`;

				//проверка директории
				async function checkDir(dir) {

					const r = await new Promise((resolve, reject) => {

						fs.access(dir, (err) => {
							if (err) {
								//console.log(err.message);
								return resolve(false);
							}
							return resolve(true);
						});
					});


					if (r) {
						return Promise.resolve(1);
					}

					//если нет каталога - создать каталог
					await new Promise((resolve, reject) => {
						//-->при recursive: false - поялвляется ошибка - потому что в выборке существуют два хэша с одинаковым первым символом - видимо асинхронное обращение к одному и тому же файлу
						fs.mkdir(dir, { recursive: true }, (err) => {
							if (err) {
								//throw err;
								console.log(`каталог ${dir} не создан`);
								reject();
								return;
							}
							//console.log(`каталог ${dir} создан`);
							resolve();
						});
					});

					return Promise.resolve(1);
				};

				try {

					let n1 = await checkDir(`${root}\\${part1}`);
					let n2 = await checkDir(`${root}\\${part1}\\${part2}`);
					let n3 = await checkDir(`${root}\\${part1}\\${part2}\\${part3}`);
				} catch (e) {
					console.log(e);
				}

				await new Promise((resolve, reject) => {

					let readStream = fs.ReadStream(original_item);

					readStream.on('end', () => {
						//console.log('чтение окночено');
					});

					readStream.on('error', err => {
						console.log('событие ошибки потока readStream');
						console.log(err);
					});

					let writeStream = fs.WriteStream(path, { flag: '+a' });

					writeStream.on('finish', () => {
						//console.log('запись окончена');
						resolve();
					});

					writeStream.on('error', err => {
						console.log('событие ошибки потока writeStream');
						console.log(err);
					});

					readStream.pipe(writeStream);

				});

				resolve_top(path);
			});

			promise_arr.push(promise);
		});

		return await Promise.all(promise_arr);

	}


	/**
	 * проверяет наличие папки подходящей для файла
	 * при необходимости создает ее
	 */
	async checkDir(dir) {
		const r = await new Promise((resolve, reject) => {

			fs.access(dir, (err) => {
				if (err) {
					//console.log(err.message);
					return resolve(false);
				}
				return resolve(true);
			});
		});

		if (r) {
			return Promise.resolve(1);
		}

		//если нет каталога - создать каталог
		await new Promise((resolve, reject) => {

			fs.mkdir(dir, { recursive: true }, (err) => {
				if (err) {
					//throw err;
					reject();
					return;
				}
				resolve();
			});
		});

		return Promise.resolve(1);
	}


	/**
	 * сохраняет данные  о статье в базу
	 */
	async saveArticle(arr_imgs_src, text = 'пустота') {

		//console.log(arr_imgs_src);
		let user_id = this.req.user.user_id;

		let text_article = text;
		const promisePool = this.pool.promise();
		let connection = await promisePool.getConnection();
		try {
			await connection.beginTransaction();

			let result_q = await connection.query('INSERT INTO articles ( id_user, text ) VALUE (?,?)', [user_id, text_article]);
			// получить последний id после вставки INSERT INTO
			const last_id = result_q[0].insertId;
			let values = arr_imgs_src.map((item, index) => {
				return [last_id, item]
			});

			await connection.query('INSERT INTO imgs ( id_article, img_url ) VALUE ?', [values]);
			await connection.commit();
			connection.release();

		} catch (e) {
			//если ошибка - откатить сохраненные файлы - удалить
			console.log('ошибка записи в базу');
			console.log(e.message);
			//console.log(connection)
			await connection.query('ROLLBACK');
			connection.release();
		}

	}

	/**
	 * получить данные о всех статьях из базы
	 */
	async getArticleData() {
		//запаковать все в отдельные статьи
		const sql = "SELECT * FROM `articles` AS art LEFT JOIN `imgs` AS i ON art.id = i.id_article";

		// this.pool.getConnection((err, connection)=>{
		// 	if(err) console.log(err.message);
		// 	connection.execute(sql,[], (err, result, fields)=>{
		// 		if(err) console.log(err.message);
		// 		console.log(fields);
		// 		this.pool.releaseConnection(connection);
		// 	})
		// });

		const promisePool = this.pool.promise();
		let result = await promisePool.execute(sql);
		let rows = result[0];

		const modified_rows = {};

		rows.forEach((item, index) => {
			if (!(item.id_article in modified_rows)) {
				modified_rows[item.id_article] = [];
			}
			modified_rows[item.id_article].push(item);
		});

		rows.forEach((item, index) => {
			const regex = /public\\[\\a-z0-9\.]*/gi;
			const text = item.img_url.match(regex)[0];
			item.img_url = text;
		});
		return modified_rows;
	}

	/**
	 * Удалить выбранную статью
	 */
	async deleteArticle(id) {

		//получить все записи по id
		let sql = "SELECT `id_article`, `img_url` FROM `articles` AS art LEFT JOIN imgs AS i ON art.id = i.id_article WHERE art.id = ?";

		const articles = await new Promise((resolve, reject) => {
			this.pool.getConnection(async (err, connection) => {
				if (err) {
					console.log(err);
					reject(err);
					return;
				}

				connection.execute(sql, [id], (err, result, fields) => {
					if (err) {
						console.log(err);
						reject(err);
						return;
					}
					resolve(result);
					this.pool.releaseConnection(connection);
				})
			})
		});

		const img_arr = [];

		articles.forEach((item, index) => {
			const url = item.img_url;
			img_arr.push(url);
		})

		//удалить все файлы
		async function deleteFile(img_arr) {

			const arr_promise = [];

			img_arr.forEach((item, index) => {

				let promise = new Promise(async (resolve, reject) => {


					let isset_file = await new Promise((resolve1, reject2) => {

						fs.access(item, fs.constants.F_OK, (err) => {
							if (err) {
								reject2(true);
								return;
							}
							resolve1(true);
						});
					}).catch((err) => {
						resolve();
						return;
					});

					//удалить файл
					fs.unlink(item, (err) => {
						if (err) {
							resolve(true);
							return;
						}
						resolve(true);
					});
				});
				arr_promise.push(promise);
			});
			return await Promise.all(arr_promise);
		}

		//удалить из базы статью
		async function DeleteInDB(id) {

			const promisePool = this.pool.promise();

			let connection = await promisePool.getConnection();
			try {
				await connection.beginTransaction();
				await connection.query('DELETE FROM articles WHERE articles.id = ?', [id]);
				await connection.query('DELETE FROM imgs WHERE imgs.id_article = ?', [id]);
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

		try {
			await DeleteInDB.call(this, id);
		} catch (error) {
			console.log(error.message);
			console.log('удаление данных из базы не удалось');
			return;
		}

		await deleteFile(img_arr);

	}

}

module.exports = MainModel;

