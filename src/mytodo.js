'use strict'

class Blog extends React.Component {

  constructor(props) {
    super(props)

    this.state = {

      array_article: [],
      test: 1
    }
    this.callbackToForm = this.callbackToForm.bind(this)


    this.testCallBack = this.testCallBack.bind(this)
  }

  componentDidMount() {

    this.callbackToForm()

  }

  testCallBack() {

    this.setState({
      test: this.state.test + 1
    })

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
          //array_article : this.state.array_article.concat(['test3', 'test4', 'test5'])
          array_article: data // данные возвращаемые с сервера
        })
      })
      .catch((e) => {
        console.log(e);
      })
  }

  render() {
    return (
      <div className='container'>
        <p>Тестовое свойство: {this.state.test}</p>
        <Form callbackToForm={this.callbackToForm} testCallBack={this.testCallBack} />
        <ArticleList array_article={this.state.array_article} />
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

    this.click = this.click.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlerText = this.handlerText.bind(this);
    this.handlerTextarea = this.handlerTextarea.bind(this);
  }

  //отправляетсзапрос к бд на добавление записи
  handleSubmit(event) {

    event.preventDefault();

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

  click() {
    event.preventDefault();
    this.props.testCallBack();
    this.props.callbackToForm() 
  }

  render() {
    return (
      <form className='container' onSubmit={this.handleSubmit}>

        <button onClick={this.click}>кнопка</button>

        <div>
          <label for='text'>Заголовок ==== {this.state.text}</label>
          <br />
          <input onInput={this.handlerText} type='text' id='text' name='text' value={this.state.text}></input>
        </div>
        <div>
          <p>textarea ==== {this.state.textarea}</p>
          <textarea onInput={this.handlerTextarea} name='textarea' placeholder='Значение' value={this.state.textarea} />
        </div>
        <div>
          <label>
            Upload file:
          <input type="file" ref={this.fileInput} />
          </label>
        </div>

        <p>результат:</p>
        {this.state.result}
        <br />
        <input type='submit' value='Отправить' ></input>

      </form>
    )
  }
}

//задача - выводить все сохраненные в базе статьи
//теоретически - выводить только первые три, остальные при прокрутке вниз дорисовывать

class ArticleList extends React.Component {

  constructor(props) {
    super(props)
  }

  //получить все записи
  render() {
    //получить список данных из базы - тут сфрмировать массив из JSX элементов и передать в рендер
    let arr_elem_list = this.props.array_article.map((item, index) => {
      return <Article key={index} item={item} />;
    });

    return (
      <div className='container'>
        <p>Возвращает список статей</p>
        <ul>
          {arr_elem_list}
        </ul>
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

  render() {
    //тут сделать форму для вывода текста и картинки
    return (

      <div className='container'>
        <p>{this.props.item.title} </p>
        <p>{this.props.item.content}</p>
        <p>Картинка</p>
        <img alt='ничего нет' src={this.props.item.url_to_file} height='200px' width='200px'></img>
      </div>
    )
  }

}

ReactDOM.render(<Blog />, document.getElementById('app2'));