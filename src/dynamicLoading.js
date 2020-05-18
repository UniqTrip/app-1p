'use strict';

//компонент постепенно загружающий данные из базы

class DynamicLoading extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      lastIndexArticle: 0,
      array_article: [],
      testkey: 1,
    }

    this.testkey2 = 1;
    this.end = false;
    this.wheelCounter = 0;
  }

  componentDidMount() {
    
    if (this.testkey2 == 1) {
      this.getArticle();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    //просто узнать что запрос вернул данные
    // setTimeout(() => {
    //   this.setState({ testkey: 1 })
    // }, 500)

    //в общем нужно проверять какой апдейт был осуществлен
    console.log('Был апдейт');
    console.log(this.testkey2);
    setTimeout(() => {
      this.testkey2 = 1
    }, 300)
  }

  //получить на старте с сервера данные - первые три записи запросов
  getArticle = () => {
    //запрос к базе на получение первых трех записей
    const opt = {
      method: 'POST',
      // если ноль то выбираем из базы с первого, если нет - то с индекса 
      body: this.state.lastIndexArticle == 0 ? '' : this.state.lastIndexArticle  
    }
    this.testkey2 = 0;
    fetch('/getArticle', opt)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        //data = JSON
        if (data.length == 0) {
          console.log('Больше элементов для подгрузки нет - getArticle');
          this.end = true;
          return;
        }
        this.setState({
          array_article: this.state.array_article.concat(data),
          lastIndexArticle: data[data.length - 1].id  //тут получить последний индекс
        })
      })
      .catch((err) => { console.log(err) })
  }


  handlerWheel = (event) => {

    if( event.deltaY > 0 &&  this.testkey2 == 1 && this.end == false){
      this.getArticle()
    }

  }

  render() {

    console.log(this.state.array_article);

    const arr_elem = this.state.array_article.map((item, index) => {
      return <Article key={index} item={item} />;
    })

    //вариант загузки функции
    //let t = this.state.testkey == 1 ? this.handlerWheel : function () { }

    return (
      <div className='container' style={{ width: '100%', height: '900px', overflow: 'auto', margin: '10px', padding: '5px' }}
        ref={this.articleCont}
        onWheel={this.handlerWheel}
        className='container dlloader'
      >
        <button onClick={this.getArticle}>Добавить три элемента</button>
        <p>Последний индекс: {this.state.lastIndexArticle} </p>
        {arr_elem}
        <p></p>
      </div>
    )
  }
}


class Article extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    //тут сделать форму для вывода текста и картинки
    return (
      <div className='container' style={{ width: '500px' }} >
        <img style={{ width: '100px' }} className="card-img-top" src={this.props.item.url_to_file} alt="Картинка отсутствует" style={{ height: '200px' }} />
        <div className="blog column text-center">
          <h4 className='card-title'>{this.props.item.title}</h4>
          <p className="card-text" >{this.props.item.content}</p>
        </div>
      </div>
    )
  }
}


ReactDOM.render(<DynamicLoading />, document.getElementById('app_dynamic'));
