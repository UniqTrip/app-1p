'use strict';

(function(){

  class Blog extends React.Component {

    constructor(props) {
      super(props)
  
      this.state = {
  
        array_article: [],
  
      }
      this.callbackToForm = this.callbackToForm.bind(this)
  
  
    }
  
    componentDidMount() {
  
      this.callbackToForm()
  
    }
  
  
    callbackToForm() {
      //тут вызвать запрос к базе данных и обновить стэйт  
      let opt = {
        method: 'POST',
        body: ''
      }
  
      fetch('/blog-get-all-article', opt)
        .then((response) => {
          //возвращает объект из базы
          return response.json();
        })
        .then((data) => {
          console.log('Данные из метода callbackToForm из компонента Blog')
          console.log(data);
          //обновить стэйты
          this.setState({
            array_article: data // данные возвращаемые с сервера
          })
        })
        .catch((e) => {
          console.log(e);
        })
    }
  
    render() {
      return (
        <div className='container' style={{ width: '70%', paddingBottom: '150px' }}>
  
          <Form callbackToForm={this.callbackToForm} />
          <ArticleList callbackToForm={this.callbackToForm} array_article={this.state.array_article} />
        </div>
      );
    }
  }
  
  
  //задача - запись в базу заголовка, текста и сохранение картинки
  class Form extends React.Component {
    constructor(props) {
      super(props)
  
      this.state = {
        text: '',
        textarea: '',
        result: '!'
      }
  
      this.fileInput = React.createRef();
  
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handlerText = this.handlerText.bind(this);
      this.handlerTextarea = this.handlerTextarea.bind(this);
    }
  
    //отправляетсзапрос к бд на добавление записи
    handleSubmit(event) {
  
      event.preventDefault();
      let randomString = Math.random().toString(36);
      this.setState({
        text: '',
        textarea: '',
        theInputFileKey: randomString
      })
  
  
      let formData = new FormData();
  
      formData.append('text', this.state.text)
  
      formData.append('textarea', this.state.textarea);
  
      formData.append('file', this.fileInput.current.files[0]);
  
      const opt = {
        method: 'POST',
        body: formData
      }
  
      fetch('/blog_add_article', opt)
        .then((response) => {
          //console.log(response);
          return response.text();
        })
        .then((data) => {
          //this.props.callbackToForm() 
          this.setState({
            result: data
          }, () => {
            this.props.callbackToForm()
          })
        })
        .catch((e) => {
          console.log(e);
        })
  
      this.fileInput.value = '';
    }
  
    handlerText(event) {
      this.setState({
        text: event.target.value
      })
    }
  
    handlerTextarea(event) {
      this.setState({
        textarea: event.target.value
      })
    }
  
    render() {
      return (
        <form className='container' onSubmit={this.handleSubmit}>
          <div>
            <label for='text'>Заголовок</label>
            <br />
            <input className="form-control" onInput={this.handlerText} type='text' id='text' name='text' value={this.state.text}></input>
          </div>
          <div>
            <p >Контент</p>
            <textarea className="form-control" onInput={this.handlerTextarea} name='textarea' placeholder='Значение' value={this.state.textarea} />
          </div>
          <div className='form-group'>
            <label>
              Upload file:
            <input key={this.state.theInputFileKey || ''} className='form-control-file' type="file" ref={this.fileInput} />
            </label>
          </div>
          <input type='submit' value='Отправить' ></input>
        </form>
      )
    }
  }
    
  class ArticleList extends React.Component {
  
    constructor(props) {
      super(props)
    }
  
    //получить все записи
    render() {
      //получить список данных из базы - тут сфрмировать массив из JSX элементов и передать в рендер
      let arr_elem_list = this.props.array_article.map((item, index) => {
        return <Article key={index} item={item} callbackToForm={this.props.callbackToForm} />;
      });
  
      return (
        <div className='container'>
          <p>Возвращает список статей</p>
          <div className='row'>
            {arr_elem_list}
          </div>
        </div>
      )
    }
  }
  
  //получает из ArticleList props с текстом и ссылкой на картиночку
  //возможно есть крестик - закрыть и удалить статью из базы
  class Article extends React.Component {
  
    constructor(props) {
      super(props)
    }
  
    delArticle = () => {
      let dataBody = {id : this.props.item.id ,path : this.props.item.url_to_file};
  
      let opt = {
        method: 'POST',
        body: JSON.stringify(dataBody),
        header: {
          'content_type': 'application/json'
        } 
      }
  
      fetch('/delArticle', opt)
        .then((response)=>{
          return response.text()
        })
        .then((data)=>{
          console.log(data);
          //тут выполнить колбек на перерисовку всех карточек
          this.props.callbackToForm();
  
        })
        .catch(e=>console.log(e))
    };
  
    enlaregImg = ()=>{
      alert('ужс');
    };
  
    render() {
      //тут сделать форму для вывода текста и картинки
      return (
        <div className="card" style={{ width: '30%', height: '300px', overflow: 'auto', margin: '10px', padding: '5px' }}>
          <img onClick={this.enlaregImg}
          className="card-img-top" src={this.props.item.url_to_file} alt="Картинка отсутствует" style={{ height: '200px' }} />
          <div className="blog column text-center">
            <h4 className='card-title'>{this.props.item.title}</h4>
            <p className="card-text" >{this.props.item.content}</p>
            <button onClick={this.delArticle}>Удалить карточку #:{this.props.item.id}</button>
          </div>
        </div>
  
      )
    }
  
  }
  
  ReactDOM.render(<Blog />, document.getElementById('app2'));

})()

