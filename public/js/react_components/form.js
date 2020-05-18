'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Form = function (_React$Component) {
  _inherits(Form, _React$Component);

  function Form(props) {
    _classCallCheck(this, Form);

    var _this = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this, props));

    _this.state = {
      valueText1: '',
      valueText2: '',
      result: '1',
      array_list: [1, 2, 3]
    };

    _this.fileInput = React.createRef();

    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.handleEvent1 = _this.handleEvent1.bind(_this);
    _this.handleEvent2 = _this.handleEvent2.bind(_this);
    _this.getAllline = _this.getAllline.bind(_this);
    _this.getAllline();
    return _this;
  }

  //отправляю запрос к серверу - который сохраняет данные на сервре


  _createClass(Form, [{
    key: 'handleSubmit',
    value: function handleSubmit(event) {
      var _this2 = this;

      event.preventDefault();

      //console.log(`Выбранный файл` + this.fileInput.current.files[0].size)

      var formData = new FormData();

      formData.append('data', this.state.valueText1 + ' ::: ' + this.state.valueText2);

      formData.append('file', this.fileInput.current.files[0]);

      //console.log(this.fileInput.current.files[0]);

      var opt = {
        method: 'POST',
        body: formData
      };

      fetch('/react_post_query', opt).then(function (response) {
        //console.log(response);
        return response.text();
      }).then(function (data) {
        //console.log(data);
        _this2.setState({
          result: data
        });
      }).catch(function (e) {
        console.log(e);
      });

      //этот вызов должен получить все записи из базы 
      this.getAllline();
    }
  }, {
    key: 'handleEvent1',
    value: function handleEvent1(event) {
      this.setState({
        valueText1: event.target.value
      });
    }
  }, {
    key: 'handleEvent2',
    value: function handleEvent2(event) {
      this.setState({
        valueText2: event.target.value
      });
    }

    //метод возвращает все записи из базы

  }, {
    key: 'getAllline',
    value: function getAllline() {
      var _this3 = this;

      var opt = {
        method: 'POST',
        bode: 'тело запроса getAllline '
      };

      fetch('/get-all-line', opt).then(function (res) {
        return res.json();
      }).then(function (data) {
        //console.log(data);
        //let r = JSON.parse(data);

        // а вот тут нужно отрисовать
        _this3.setState({
          array_list: data
        });
      }).catch(function (e) {
        console.log(e);
      });
    }
  }, {
    key: 'render',
    value: function render() {

      return React.createElement(
        'form',
        { onSubmit: this.handleSubmit },
        React.createElement(
          'p',
          null,
          '\u0422\u0435\u043A\u0441\u04421 - value "',
          this.state.valueText1,
          '" '
        ),
        React.createElement('input', { type: 'text', name: 'text1', value: this.state.valueText1, onInput: this.handleEvent1 }),
        React.createElement(
          'p',
          null,
          '\u0422\u0435\u043A\u0441\u04422 -value "',
          this.state.valueText2,
          '"'
        ),
        React.createElement('input', { type: 'text', name: 'text2', value: this.state.valueText2, onInput: this.handleEvent2 }),
        React.createElement(
          'p',
          null,
          '\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0444\u0430\u0439\u043B\u0430'
        ),
        React.createElement(
          'label',
          null,
          'Upload file:',
          React.createElement('input', { type: 'file', ref: this.fileInput })
        ),
        React.createElement('br', null),
        React.createElement('input', { type: 'submit', value: '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C!' }),
        React.createElement(
          'p',
          null,
          '\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 - \u0441\u0440\u0430\u0437\u0443 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u043F\u0440\u043E\u0441\u0442\u043E \u043E\u0442\u0432\u0435\u0442 \u0441\u0435\u0440\u0432\u0435\u0440\u0430:'
        ),
        React.createElement(
          'div',
          null,
          this.state.result
        ),
        React.createElement(
          'p',
          null,
          '\u0422\u0435\u043F\u0435\u0440\u044C \u043D\u0443\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0432\u0441\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445 '
        ),
        this.state.array_list,
        React.createElement(
          'p',
          null,
          '\u0421\u0434\u0435\u043B\u0430\u0442\u044C \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 LIST'
        ),
        React.createElement(List, { arr: this.state.array_list })
      );
    }
  }]);

  return Form;
}(React.Component);

var List = function (_React$Component2) {
  _inherits(List, _React$Component2);

  function List(props) {
    _classCallCheck(this, List);

    return _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, props));
  }

  _createClass(List, [{
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState, snapshot) {}
  }, {
    key: 'render',
    value: function render() {

      var items = this.props.arr.map(function (item, index) {
        return React.createElement(
          'li',
          { key: index },
          '\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 --> ',
          item
        );
      });

      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          '\u0422\u0435\u0441\u0442 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 LIST:'
        ),
        React.createElement(
          'ul',
          null,
          items
        )
      );
    }
  }]);

  return List;
}(React.Component);

var domContainer = document.getElementById('react_container');
ReactDOM.render(React.createElement(Form, null), domContainer);