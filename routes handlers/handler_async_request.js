const https = require('https');
const fs = require('fs');
const util = require('util');
const querystring = require('querystring');
const url = require('url');

module.exports.defRender = function (req, res) {

	res.render('async-request.hbs');

}


module.exports.APIrequest = function (req, res) {
	console.log('Событие')

	const promis_arr = [];

	for (let i = 0; i < 100; i++) {
		promis_arr.push(Foo());
	}

	Promise.all(promis_arr)
		.then((response) => {

			response.forEach((item) => {
				console.log(item);
			})

		})
		.catch((err) => {
			console.log(err);
		})

}

function Foo() {

	return new Promise(function (resolve, reject) {

		const options = {
			hostname: 'postman-echo.com',
			path: '/post',
			method: 'POST',
		}

		let serv_req = https.request(options, (response) => {

			let result = '';

			response.on('readable', () => {
				let data = response.read();
				if (data !== null) {
					result += data;
				}
			})

			response.on('end', () => {
				resolve(result);
			})

			response.on('error', (err) => {
				console.log(err);
				reject();
			})

		});

		serv_req.end();
	})

}


//промисы, асинхронный запрос к кладр без отсрочки - перегружают сервер кладр и он возвращает 502 bad gateway
module.exports.toKLADR = function (req, res) {
	console.log('toKLADR2')
	const fs_p = util.promisify(fs.readFile);
	fs_p('поиск по кладр.txt', { encoding: 'utf-8' })
		.then((data) => {
			let arr_data = data.split('\r\n');

			function req_KLADR(item) {
				const item_q = item;
				const KLADR_url = 'https://kladr-api.ru/api.php';
				let query = { streetId: item_q, contentType: 'street' };
				query = querystring.stringify(query);
				res_query_str = `${KLADR_url}?${query}`;

				return new Promise((resolve, reject) => {

					const req_get = https.get(res_query_str, (response) => {
						//response.setEncoding('utf-8');
						let result = '';
						response.on('readable', () => {
							let data = response.read();
							if (data !== null) {
								result += data;
							}
						});

						response.on('end', () => {
							response.setEncoding('utf-8');
							//result = JSON.parse(result);
							//result = decodeURI(result);
							resolve(result);

						});

						response.on('error', (err) => {
							reject(err);
						})
					});
					req_get.end();
				})
			}
			let delay = 0;
			let arr_promise = [];
			for (let i = 0; i < arr_data.length; i++) {
				arr_promise.push(req_KLADR(arr_data[i]));
			}
			return Promise.all(arr_promise);
		})
		.then((t) => {
			t.forEach((item) => {
				console.log(item);
			})
			//записать в файл
			fs.writeFile("клдар-результат.txt", t, function (error) {
				if (error) throw error; // если возникла ошибка
			});

		})
		.catch((err) => {
			console.log(err);
		})

	res.end('1');
}

//асинхронный запрос к кладр с отсрочкой
module.exports.toKLADR1 = function (req, res) {
	fs.readFile('поиск по кладр.txt', { encoding: 'utf-8' }, (err, data) => {
		if (err) console.log(err);
		let arr_data = data.split('\r\n');
		let delay = 100;
		for (let i = 0; i < arr_data.length; i++) {
			setTimeout(() => {
				const url = `https://kladr-api.ru/api.php?streetId=${arr_data[i]}&contentType=street`;
				const req_get = https.get(url, (response) => {
					let result = '';
					response.on('data', (data) => {
						result += data;
					});

					response.on('end', () => {
						console.log(result);
					})
				})
			}, delay)
			delay += 50;
		}
	})
	res.end(1);
}


//промисы, асинхронный запрос к кладр с отсрочкой
module.exports.toKLADR2 = function (req, res) {
	const fs_p = util.promisify(fs.readFile);
	fs_p('поиск по кладр.txt', { encoding: 'utf-8' })
		.then((data) => {
			let arr_data = data.split('\r\n');

			function req_KLADR(item) {

				const url = `https://kladr-api.ru/api.php?streetId=${item}&contentType=street`;
				return new Promise((resolve, reject) => {

					setTimeout(() => {
						https.get(url, (response) => {
							//response.setEncoding('utf-8');
							let result = '';
							response.on('readable', () => {
								let data = response.read();
								if (data !== null) {
									result += data;
								}
							});

							response.on('end', () => {
								response.setEncoding('utf-8');
								result = JSON.parse(result);
								//result = decodeURI(result);
								//console.log(result);
								if (result.result.length > 0) {
									//результат есть
									resolve({
										id: result.result[0].id,
										name: result.result[0].name,
										zip: result.result[0].zip,
										okato: result.result[0].okato,
									})
								} else {
									resolve({});
								}
							});

							response.on('error', (err) => {
								reject(err);
							})
						});

					}, delay);
				})
			}

			let delay = 0;
			let arr_promise = [];
			for (let i = 0; i < arr_data.length; i++) {

				arr_promise.push(req_KLADR(arr_data[i]));

				delay += 50;
			}
			//return Promise.all(arr_promise);
			return Promise.all(arr_promise);
		})
		.then((t) => {
			//обработать массив данных от кладр
			//console.log(t);
			//записать в файл
			fs.writeFile("кладр-результат.txt", t, function (error) {
				if (error) throw error; // если возникла ошибка
			});
			//отдавать данные потоком res.write()
			t = JSON.stringify(t);
			res.end(t);
		})
		.catch((err) => {
			console.log(err);
		})

	//res.end('1');
}

	//полифилл для Promise.allSettled 
	Promise.allSettled = function (promises) {
		return Promise.all(promises.map(p => Promise.resolve(p).then(value => ({
			state: 'fulfilled',
			value: value
		}), error => ({
			state: 'rejected',
			reason: error
		}))));
	};
