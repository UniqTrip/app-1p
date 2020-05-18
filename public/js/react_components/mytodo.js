'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Blog = function (_React$Component) {
  _inherits(Blog, _React$Component);

  function Blog(props) {
    _classCallCheck(this, Blog);

    var _this = _possibleConstructorReturn(this, (Blog.__proto__ || Object.getPrototypeOf(Blog)).call(this, props));

    _this.state = {

      array_article: [],
      test: 1
    };
    _this.callbackToForm = _this.callbackToForm.bind(_this);

    _this.testCallBack = _this.testCallBack.bind(_this);
    return _this;
  }

  _createClass(Blog, [{
    key: 'componentDidMount',
    value: function componentDidMount() {

      this.callbackToForm();
    }
  }, {
    key: 'testCallBack',
    value: function testCallBack() {

      this.setState({
        test: this.state.test + 1
      });
    }
  }, {
    key: 'callbackToForm',
    value: function callbackToForm() {
      var _this2 = this;

      //тут вызвать запрос к базе данных и обновить стэйт  
      var opt = {
        method: 'POST',
        body: ''
      };

      fetch('/blog-get-all-article', opt).then(function (response) {
        //возвращает объект из базы
        return response.json();
      }).then(function (data) {
        console.log('Данные из метода callbackToForm из компонента Blog');
        console.log(data);
        //обновить стэйты
        _this2.setState({
          //array_article : this.state.array_article.concat(['test3', 'test4', 'test5'])
          array_article: data // данные возвращаемые с сервера
        });
      }).catch(function (e) {
        console.log(e);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'p',
          null,
          '\u0422\u0435\u0441\u0442\u043E\u0432\u043E\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E: ',
          this.state.test
        ),
        React.createElement(Form, { callbackToForm: this.callbackToForm, testCallBack: this.testCallBack }),
        React.createElement(ArticleList, { array_article: this.state.array_article })
      );
    }
  }]);

  return Blog;
}(React.Component);

//задача - запись в базу заголовка, текста и сохранение картинки


var Form = function (_React$Component2) {
  _inherits(Form, _React$Component2);

  function Form(props) {
    _classCallCheck(this, Form);

    var _this3 = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this, props));

    _this3.state = {
      text: '',
      textarea: '',
      result: '!'
    };

    _this3.fileInput = React.createRef();

    _this3.click = _this3.click.bind(_this3);

    _this3.handleSubmit = _this3.handleSubmit.bind(_this3);
    _this3.handlerText = _this3.handlerText.bind(_this3);
    _this3.handlerTextarea = _this3.handlerTextarea.bind(_this3);
    return _this3;
  }

  //отправляетсзапрос к бд на добавление записи


  _createClass(Form, [{
    key: 'handleSubmit',
    value: function handleSubmit(event) {
      var _this4 = this;

      event.preventDefault();

      var formData = new FormData();

      formData.append('text', this.state.text);

      formData.append('textarea', this.state.textarea);

      formData.append('file', this.fileInput.current.files[0]);

      var opt = {
        method: 'POST',
        body: formData
      };

      fetch('/blog_add_article', opt).then(function (response) {
        //console.log(response);
        return response.text();
      }).then(function (data) {
        //this.props.callbackToForm() 
        _this4.setState({
          result: data
        }, function () {
          _this4.props.callbackToForm();
        });
      }).catch(function (e) {
        console.log(e);
      });
    }
  }, {
    key: 'handlerText',
    value: function handlerText(event) {
      this.setState({
        text: event.target.value
      });
    }
  }, {
    key: 'handlerTextarea',
    value: function handlerTextarea(event) {
      this.setState({
        textarea: event.target.value
      });
    }
  }, {
    key: 'click',
    value: function click() {
      event.preventDefault();
      this.props.testCallBack();
      this.props.callbackToForm();
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'form',
        { className: 'container', onSubmit: this.handleSubmit },
        React.createElement(
          'button',
          { onClick: this.click },
          '\u043A\u043D\u043E\u043F\u043A\u0430'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { 'for': 'text' },
            '\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A ==== ',
            this.state.text
          ),
          React.createElement('br', null),
          React.createElement('input', { onInput: this.handlerText, type: 'text', id: 'text', name: 'text', value: this.state.text })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'p',
            null,
            'textarea ==== ',
            this.state.textarea
          ),
          React.createElement('textarea', { onInput: this.handlerTextarea, name: 'textarea', placeholder: '\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435', value: this.state.textarea })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            null,
            'Upload file:',
            React.createElement('input', { type: 'file', ref: this.fileInput })
          )
        ),
        React.createElement(
          'p',
          null,
          '\u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442:'
        ),
        this.state.result,
        React.createElement('br', null),
        React.createElement('input', { type: 'submit', value: '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C' })
      );
    }
  }]);

  return Form;
}(React.Component);

//задача - выводить все сохраненные в базе статьи
//теоретически - выводить только первые три, остальные при прокрутке вниз дорисовывать

var ArticleList = function (_React$Component3) {
  _inherits(ArticleList, _React$Component3);

  function ArticleList(props) {
    _classCallCheck(this, ArticleList);

    return _possibleConstructorReturn(this, (ArticleList.__proto__ || Object.getPrototypeOf(ArticleList)).call(this, props));
  }

  //получить все записи


  _createClass(ArticleList, [{
    key: 'render',
    value: function render() {
      //получить список данных из базы - тут сфрмировать массив из JSX элементов и передать в рендер
      var arr_elem_list = this.props.array_article.map(function (item, index) {
        return React.createElement(Article, { key: index, item: item });
      });

      return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'p',
          null,
          '\u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u043F\u0438\u0441\u043E\u043A \u0441\u0442\u0430\u0442\u0435\u0439'
        ),
        React.createElement(
          'ul',
          null,
          arr_elem_list
        )
      );
    }
  }]);

  return ArticleList;
}(React.Component);

//получает из ArticleList props с текстом и ссылкой на картиночку
//возможно есть крестик - закрыть и удалить статью из базы


var Article = function (_React$Component4) {
  _inherits(Article, _React$Component4);

  function Article(props) {
    _classCallCheck(this, Article);

    return _possibleConstructorReturn(this, (Article.__proto__ || Object.getPrototypeOf(Article)).call(this, props));
  }

  _createClass(Article, [{
    key: 'render',
    value: function render() {
      //тут сделать форму для вывода текста и картинки
      return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'p',
          null,
          this.props.item.title,
          ' '
        ),
        React.createElement(
          'p',
          null,
          this.props.item.content
        ),
        React.createElement(
          'p',
          null,
          '\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430'
        ),
        React.createElement('img', { alt: '\u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435\u0442', src: this.props.item.url_to_file, height: '200px', width: '200px' })
      );
    }
  }]);

  return Article;
}(React.Component);

ReactDOM.render(React.createElement(Blog, null), document.getElementById('app2'));