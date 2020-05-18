 
class User{

	constructor(){
		this.roles;
		this.permissions;
	}
	
	

	/**
	 * Инициирует роли и разрешения объекта user
	 */
	async init(req,res){
		// this.roles= await this.getRoles();
		// this.permissions = await this.getPermissions(); 

		return new Promise((resolve, reject)=>{

			new Promise((resolve, reject)=>{
				setTimeout(()=>{
					resolve('Чет первое получил');
				}, 1000);
			})
			.then((data)=>{
				console.log(data);
				return this.getRoles();
			})
			.then((roles)=>{
				console.log(roles);
				this.roles = roles;
				return this.getPermissions();
			})
			.then(permissions=>{
				console.log(permissions);
				this.permissions = permissions;
				resolve(this);		
				//res.render('main.hbs', {});
			})
			.catch(err=>{
				console.log(err.message);
				reject(err.message);
			});			
		});
	}

	/**
	 * получить роли
	 */
	async getRoles(){
		return new Promise((resolve, reject)=>{
			setTimeout(()=>{
				resolve(['роли'])
			}, 1000);
		});
	}

	/**
	 * получить разрешения
	 */
	async getPermissions(){
		return new Promise((resolve, reject)=>{
			setTimeout(()=>{
				return resolve(['разрешения']);
			}, 1500);
		});
	}
}

module.exports = User;