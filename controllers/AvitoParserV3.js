const https = require('https');
const fs = require('fs');
//const url = require('url');
const path = require('path');
const cheerio = require('cheerio');
const querystring = require('querystring');
const Controller = require('./Controller');

class AvitoParserV3 extends Controller {
	constructor(req, res) {
		super(req, res)
		this.req = req;
		this.res = res;
	}

	async test() {
		//let url = 'https://www.avito.ru/sochi/avtomobili/peugeot/407_1319/i-20042011_2828-ASgBAgICA0Tgtg2AmSjitg2QnCjqtg2M4ig?p=1&cd=1&radius=1000';

		// url = https://www.avito.ru/rossiya/avtomobili/peugeot/406/kupe-ASgBAQICAkTgtg2AmSjitg2MnCgBQOa2DRTCtyg?cd=1
		try {
			//рекурсивная функция парсящая данные со страницы авито
			rec(1, this.req.custom_path);
		} catch (err) {
			console.log(err);
		}

		this.res.end('end');
	}

}

module.exports = AvitoParserV3;


async function rec(root_index, root_path) {

	let current_url = `/sochi/avtomobili/peugeot/407_1319/i-20042011_2828-ASgBAgICA0Tgtg2AmSjitg2QnCjqtg2M4ig?p=${root_index}&cd=1&radius=1000`;

	//let current_url = `/rossiya/avtomobili/peugeot/406/kupe-ASgBAQICAkTgtg2AmSjitg2MnCgBQOa2DRTCtyg?cd=${root_index}`;

	let modify_current_url = 'https://www.avito.ru' + current_url;

	//гет запрос
	//получил страницы из пагинации
	let html = await new Promise((resolve, reject) => {

		let req1 = https.get(modify_current_url, (res) => {

			if (res.statusCode != 200) {
				console.log(res.statusCode);
				console.log(res.headers);
				console.log(res.statusCode);
				return;
			}

			//console.log(res.statusMessage);

			let html = '';
			res.on('data', (data) => {
				html += data;
			});

			res.on('end', () => {
				//console.log(html);
				resolve(html);
			});

			res.on('error', (err) => {
				reject(err.message);
			})
		});

		req1.on('error', (error) => {
			console.log('ошибка запроса rec');
		});

	});


	//парсинг хтмл
	let $ = cheerio.load(html);

	//получить url из последнего элемента пагинации
	let last_pages_url = $(".index-content-2lnSO .pagination-hidden-3jtv4 a").last().attr('href');


	// //получить массив объявлнений
	let advertisements = $('.index-root-2c0gs .js-catalog_serp .item__line');

	//массив url на отдельные страницы авто
	let arr_url_auotmobile = [];

	//из массива объявлений со страницы пагинации , в каждом объявлении получить url для перехода на отдельную страницу кажлго объявления
	advertisements.each((index, element) => {
		let text = $(element).find('.item-photo > a').attr('href');
		let url = `https://www.avito.ru${text}`;
		arr_url_auotmobile.push(url);
	});

	//создать каталог page${index} - в него записывать все объявления
	let path_file = await new Promise((resolve, reject) => {
		let path_file = `${root_path}\\file\\validatorv3\\page${root_index}`;
		fs.mkdir(path_file, { recursive: true }, (err) => {
			if (err) {
				console.log('Ошибка создания файла страницы из пагинации');
				reject();
				return;
			}
			resolve(path_file);
		})
	});

	//let promise_arr = [];

	//цикл который переходит по каждой ссылке отдельного обявления на странице и сохраняиет html, сохраняет ссылки на картинки и сохраняиет все это в каталоге
	for (let index = 0; index < arr_url_auotmobile.length; index++) {

		let url = arr_url_auotmobile[index];

		
		await new Promise(async (resolve_top, reject_top) => {
			//получаю html отдельного обявления
			let html = await new Promise((resolve, reject) => {
				let rq = https.get(url, (res) => {

					let html;
					res.on('data', (data) => {
						html += data;
					});
					res.on('end', () => {
						resolve(html);
					});
					res.on('error', () => {
						reject(err.message);
					});
				});

				rq.on('error', (err) => {
					reject(err.message);
				});
			});

			//получить данные и url для картинок из отдельной страницы автомобиля
			let $ = cheerio.load(html);

			//массив картинок (их url для загрузки)
			let imgs_items = $('.item-view-content-left .gallery-imgs-wrapper .gallery-imgs-container .gallery-img-wrapper .gallery-img-frame');
			
			//массив ссылок на картинки отдельного объявления
			let urls_img_arr = [];

			//формирует массив ссылок на картинки отдельного объявления
			imgs_items.each((index, elem) => {
				let img_url = `https:${$(elem).attr('data-url')}`;
				urls_img_arr.push(img_url);
			})

			//console.log(urls_img_arr);

			//получить описание объявления
			let description_item = $('.item-view-content-left .item-params li');

			let desc_str = '';

			description_item.each((index1, elem) => {
				let d = $(elem).text();
				desc_str += d;
			});

			desc_str = desc_str.replace(/\s\s/g, '\r\n');

			let obj = {
				'urls': urls_img_arr,
				'desc': desc_str
			};

			let dir_aitomobile = await new Promise((resolve, reject) => {

				let dir_aitomobile = `${path_file}\\automobile№${index}`;

				fs.mkdir(dir_aitomobile, { recursive: true }, async (err) => {

					if (err) {
						reject('Ошибка создания каталога для аввтомобиля');
						return;
					}

					//записать в файл описание машины
					//быть может нужно вынести вне промиса эту функцию
					await new Promise((resolve, reject) => {

						fs.writeFile(`${dir_aitomobile}\\desc_auto.txt`, obj.desc, { flasg: 'a+' }, (err) => {
							if (err) {
								console.log('Ошибка записи данных о авто в файл');
								reject()
								return;
							}
							console.log(`тут запись в файл desc_auto - ${index}`);
							resolve();
						});
					});

					resolve(dir_aitomobile);
				});

			});
			//скачать каждый файл картинки и записать в каталог по очереди циклом for(:::)
			for (let indx = 0; indx < obj.urls.length; indx++) {

				let url1 = obj.urls[indx];
				//интревал для того что бы не перегружать сайт запросами
				await new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve()
					}, 100)
				});

				//скачиаю и сохраняю картинку в требуемый каталог
				await new Promise((resolve, reject) => {

					let write_path = `${dir_aitomobile}\\img${indx}.jpg`;

					let write_stream = fs.createWriteStream(write_path, { flags: 'a+', encoding: 'binary' });

					write_stream.on('error', (err) => {
						console.log('Ошибка объекта write_stream при записи закачиваемого файла с помощью pipe');
					});

					let get_req = https.get(url1, (res) => {
						res.setEncoding('binary');
						res.pipe(write_stream);

						res.on('end', () => {
							resolve();
						});

						res.on('error', (err) => {
							console.log('Ошибка объекта res при закачке фала');
							reject();
						})

					});

					get_req.on('error', (err) => {
						console.log('ошибка запроса get_req');
						resolve()
					});
				})
			}
			//console.log('картинки из страницы сохранены');
			resolve_top();
		});

	}

	if (last_pages_url == current_url) {
		console.log(`Это последний элемент: ${last_pages_url} он равен текущему ${current_url}`);
		return;
	};
	//принудительное ограничение глубины пагинации
	if (root_index > 3) {
		console.log('FIN');
		return
	}

	++root_index;
	//далее идем рекурсивно по страницам пагинации торговой площадки
	rec(root_index,root_path );

}

