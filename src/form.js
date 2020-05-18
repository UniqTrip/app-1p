'use strict';

class Form extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      valueText1: '',
      valueText2: '',
      result: '1',
      array_list: [1,2,3]
    };

    this.fileInput = React.createRef();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEvent1 = this.handleEvent1.bind(this);
    this.handleEvent2 = this.handleEvent2.bind(this);
    this.getAllline = this.getAllline.bind(this);
    this.getAllline();
  }

  //отправляю запрос к серверу - который сохраняет данные на сервре
  handleSubmit(event) {
    event.preventDefault();

    //console.log(`Выбранный файл` + this.fileInput.current.files[0].size)

    let formData = new FormData();

    formData.append('data', `${this.state.valueText1} ::: ${this.state.valueText2}` );

    formData.append('file', this.fileInput.current.files[0] );

    //console.log(this.fileInput.current.files[0]);

    const opt = {
      method: 'POST',
      body: formData
    }

    fetch('/react_post_query', opt)
      .then((response) => {
        //console.log(response);
        return response.text();
      })
      .then((data) => {
        //console.log(data);
        this.setState({
          result: data
        })
      })
      .catch((e) => {
        console.log(e);
      })

    //этот вызов должен получить все записи из базы 
    this.getAllline();

  }


  handleEvent1(event) {
    this.setState({
      valueText1: event.target.value
    })
  }


  handleEvent2(event) {
    this.setState({
      valueText2: event.target.value
    })
  }

  //метод возвращает все записи из базы
  getAllline() {

    let opt = {
      method: 'POST',
      bode: 'тело запроса getAllline '
    }

    fetch('/get-all-line', opt)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        //console.log(data);
        //let r = JSON.parse(data);

        // а вот тут нужно отрисовать
        this.setState({
          array_list: data
        });

      })
      .catch((e) => {
        console.log(e);
      })

  }

  render() {
    
    return (
      <form onSubmit={this.handleSubmit}>
        <p>Текст1 - value "{this.state.valueText1}" </p>
        <input type='text' name='text1' value={this.state.valueText1} onInput={this.handleEvent1} ></input>
        <p>Текст2 -value "{this.state.valueText2}"</p>
        <input type='text' name='text2' value={this.state.valueText2} onInput={this.handleEvent2} ></input>
        <p>Компонент загрузки файла</p>

        <label>
          Upload file:
          <input type="file" ref={this.fileInput} />
        </label>
        <br/>

        <input type='submit' value='Отправить!'></input>
        
        <p>Результат запроса - сразу возвращает просто ответ сервера:</p>
        <div>{this.state.result}</div>
        <p>Теперь нужно вернуть все записи из базы данных </p>
        {this.state.array_list}

        <p>Сделать отдельный компонент LIST</p>
        <List arr={this.state.array_list} />
      </form>

    )

  }

}


class List extends React.Component {

  constructor(props) {
    super(props)
  }
  componentDidUpdate(prevProps, prevState, snapshot){}
  render() {

    let items = this.props.arr.map((item, index)=>{
    return <li key={index}>Значение --> {item}</li>
    })

    return (
      <div>
        <p>Тест компонента LIST:</p>
        <ul>{items}</ul>
      </div>
    )
  }
}



let domContainer = document.getElementById('react_container');
ReactDOM.render(<Form />, domContainer);