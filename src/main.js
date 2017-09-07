const React = require('react');
const ReactDOM = require('react-dom');
const App = React.createFactory(require('./js/app'));

ReactDOM.render(<App />, document.getElementById('main'));
