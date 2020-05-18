
class ReaToApi extends React.Component {
    constructor(props) {
        super(props)
    }

    onClickHandler=()=>{
        let opt = {
            method : 'POST'
        };
        
        fetch('/async-request', opt).then(()=>{}).catch(()=>{});
    }

    render() {
        return (
            <button onClick={this.onClickHandler}>Кнопка</button>
        )
    }
}


ReactDOM.render(<ReaToApi />, document.getElementById('root_req_to_API'))