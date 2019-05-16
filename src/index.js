import React from 'react';
import ReactDOM from 'react-dom';
import 'app/index.css';
import App from 'app/routes/App';
import * as serviceWorker from 'app/serviceWorker';

// Refresh the entire page every hour
setInterval(function() {
  window.location.reload(true);
}, 1000 * 60 * 60);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
