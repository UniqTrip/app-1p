var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReaToApi = function (_React$Component) {
    _inherits(ReaToApi, _React$Component);

    function ReaToApi(props) {
        _classCallCheck(this, ReaToApi);

        var _this = _possibleConstructorReturn(this, (ReaToApi.__proto__ || Object.getPrototypeOf(ReaToApi)).call(this, props));

        _this.onClickHandler = function () {
            var opt = {
                method: 'POST'
            };

            fetch('/async-request', opt).then(function () {}).catch(function () {});
        };

        return _this;
    }

    _createClass(ReaToApi, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'button',
                { onClick: this.onClickHandler },
                '\u041A\u043D\u043E\u043F\u043A\u0430'
            );
        }
    }]);

    return ReaToApi;
}(React.Component);

ReactDOM.render(React.createElement(ReaToApi, null), document.getElementById('root_req_to_API'));