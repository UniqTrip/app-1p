'use strict';

//компонент постепенно загружающий данные из базы

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DynamicLoading = function (_React$Component) {
  _inherits(DynamicLoading, _React$Component);

  function DynamicLoading(props) {
    _classCallCheck(this, DynamicLoading);

    var _this = _possibleConstructorReturn(this, (DynamicLoading.__proto__ || Object.getPrototypeOf(DynamicLoading)).call(this, props));

    _this.getArticle = function () {
      //запрос к базе на получение первых трех записей
      var opt = {
        method: 'POST',
        // если ноль то выбираем из базы с первого, если нет - то с индекса 
        body: _this.state.lastIndexArticle == 0 ? '' : _this.state.lastIndexArticle
      };
      _this.testkey2 = 0;
      fetch('/getArticle', opt).then(function (response) {
        return response.json();
      }).then(function (data) {
        //data = JSON
        if (data.length == 0) {
          console.log('Больше элементов для подгрузки нет - getArticle');
          _this.end = true;
          return;
        }
        _this.setState({
          array_article: _this.state.array_article.concat(data),
          lastIndexArticle: data[data.length - 1].id //тут получить последний индекс
        });
      }).catch(function (err) {
        console.log(err);
      });
    };

    _this.handlerWheel = function (event) {

      if (event.deltaY > 0 && _this.testkey2 == 1 && _this.end == false) {
        _this.getArticle();
      }
    };

    _this.state = {
      lastIndexArticle: 0,
      array_article: [],
      testkey: 1
    };

    _this.testkey2 = 1;
    _this.end = false;
    _this.wheelCounter = 0;
    return _this;
  }

  _createClass(DynamicLoading, [{
    key: 'componentDidMount',
    value: function componentDidMount() {

      if (this.testkey2 == 1) {
        this.getArticle();
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState, snapshot) {
      var _this2 = this;

      //просто узнать что запрос вернул данные
      // setTimeout(() => {
      //   this.setState({ testkey: 1 })
      // }, 500)

      //в общем нужно проверять какой апдейт был осуществлен
      console.log('Был апдейт');
      console.log(this.testkey2);
      setTimeout(function () {
        _this2.testkey2 = 1;
      }, 300);
    }

    //получить на старте с сервера данные - первые три записи запросов

  }, {
    key: 'render',
    value: function render() {

      console.log(this.state.array_article);

      var arr_elem = this.state.array_article.map(function (item, index) {
        return React.createElement(Article, { key: index, item: item });
      });

      //вариант загузки функции
      //let t = this.state.testkey == 1 ? this.handlerWheel : function () { }

      return React.createElement(
        'div',
        _defineProperty({ className: 'container', style: { width: '100%', height: '900px', overflow: 'auto', margin: '10px', padding: '5px' },
          ref: this.articleCont,
          onWheel: this.handlerWheel
        }, 'className', 'container dlloader'),
        React.createElement(
          'button',
          { onClick: this.getArticle },
          '\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u0440\u0438 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430'
        ),
        React.createElement(
          'p',
          null,
          '\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0438\u043D\u0434\u0435\u043A\u0441: ',
          this.state.lastIndexArticle,
          ' '
        ),
        arr_elem,
        React.createElement('p', null)
      );
    }
  }]);

  return DynamicLoading;
}(React.Component);

var Article = function (_React$Component2) {
  _inherits(Article, _React$Component2);

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
        { className: 'container', style: { width: '500px' } },
        React.createElement('img', _defineProperty({ style: { width: '100px' }, className: 'card-img-top', src: this.props.item.url_to_file, alt: '\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442' }, 'style', { height: '200px' })),
        React.createElement(
          'div',
          { className: 'blog column text-center' },
          React.createElement(
            'h4',
            { className: 'card-title' },
            this.props.item.title
          ),
          React.createElement(
            'p',
            { className: 'card-text' },
            this.props.item.content
          )
        )
      );
    }
  }]);

  return Article;
}(React.Component);

ReactDOM.render(React.createElement(DynamicLoading, null), document.getElementById('app_dynamic'));