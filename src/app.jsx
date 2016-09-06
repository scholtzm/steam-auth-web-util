import React from 'react'
import { render } from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'
import totp from 'steam-totp';

import packageJson from '../package.json';

const LOCALSTORAGE_KEY = 'sawu-keys';

const App = React.createClass({
  _generate(sharedSecret, identitySecret, timestamp, timeOffset) {
    let offset = parseInt(timeOffset, 10);
    if(isNaN(offset)) {
      offset = 0;
    }

    let result = {
      authCode: '???',
      countDown: '???',
      confKey: '???',
      detailsKey: '???',
      allowKey: '???',
      cancelKey: '???'
    };

    if(sharedSecret && sharedSecret !== '') {
      let countDown = 30 - (totp.time() % 30);
      let authCode = totp.generateAuthCode(sharedSecret, offset);

      result.authCode = authCode;
      result.countDown = countDown;
    }

    if(identitySecret && identitySecret !== '') {
      timestamp = parseInt(timestamp, 10);
      let time = totp.time(offset);

      if(!isNaN(timestamp)) {
        time = timestamp + offset;
      }

      ['conf', 'details', 'allow', 'cancel'].forEach(function(tag) {
        result[tag + 'Key'] = totp.getConfirmationKey(identitySecret, time, tag);
      });
    }

    return result;
  },

  _recalculate() {
    const newStateValues = this._generate(this.state.sharedSecret, this.state.identitySecret, this.state.timestamp, this.state.timeOffset);
    this.setState(newStateValues);
  },

  _handleSharedSecretChange(event) {
    this.setState({sharedSecret: event.target.value});
  },

  _handleIdentitySecretChange(event) {
    this.setState({identitySecret: event.target.value});
  },

  _handleTimeOffsetChange(event) {
    this.setState({timeOffset: event.target.value});
  },

  _onCurrentTimestampClick() {
    this.setState({timestamp: Math.floor(Date.now() / 1000)})
  },

  _onDynamicTimestampClick() {
    this.setState({timestamp: ''});
  },

  _onSaveClick() {
    const partialState = {
      sharedSecret: this.state.sharedSecret,
      identitySecret: this.state.identitySecret,
      timestamp: this.state.timestamp,
      timeOffset: this.state.timeOffset
    };

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(partialState));
  },

  _onClearClick() {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  },

  getInitialState: function() {
    return {
      sharedSecret: '',
      identitySecret: '',
      timestamp: '',
      timeOffset: 0,

      authCode: '???',
      countDown: '???',
      confKey: '???',
      detailsKey: '???',
      allowKey: '???',
      cancelKey: '???'
    };
  },

  componentWillMount() {
    let savedStateString = localStorage.getItem(LOCALSTORAGE_KEY);

    if(savedStateString) {
      try {
        let savedState = JSON.parse(savedStateString);
        this.setState(savedState);
      } catch(error) {
        // this should hopefully not happen
      }
    }
  },

  componentDidMount() {
    setInterval(() => {
      this._recalculate();
    }, 1000)
  },

  render() {
    return (
      <div className="container">
        <h1>Steam Auth Web Util</h1>
        <h4>Tiny browser utility to generate Steam auth codes</h4>

        <div className="input">
          <div className="message"></div>
          <div className="form-group">
            <label htmlFor="share-secret">Shared secret:</label>
            <input name="shared-secret"
              type="text"
              value={this.state.sharedSecret}
              onChange={this._handleSharedSecretChange} />
          </div>
          <div className="form-group">
            <label htmlFor="identity-secret">Identity secret:</label>
            <input name="identity-secret"
              type="text"
              value={this.state.identitySecret}
              onChange={this._handleIdentitySecretChange}/>
          </div>
          <div className="form-group">
            <label htmlFor="fixed-timestamp" title="Leave empty for live timestamp. Used only for confirmations.">Static timestamp:</label>
            <input name="fixed-timestamp"
              type="text"
              value={this.state.timestamp} />
            <button id="set-current-timestamp"
              onClick={this._onCurrentTimestampClick}>
                Set current
            </button>
            <button id="set-dynamic-timestamp"
              onClick={this._onDynamicTimestampClick}>
                Set dynamic
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="time-offset">Time offset (seconds):</label>
            <input name="time-offset"
              type="number"
              value={this.state.timeOffset}
              onChange={this._handleTimeOffsetChange} />
          </div>
          <div className="form-group">
            <input type="button"
              name="save"
              value="Save to local storage"
              onClick={this._onSaveClick} />
            <input type="button"
              name="clear"
              value="Clear local storage"
              onClick={this._onClearClick}/><br />
          </div>
        </div>

        <div className="output">
          <h4>SteamGuard</h4>
          <span id="auth-code" className="code">{this.state.authCode}</span><br />
          (Expires in <span id="auth-code-countdown">{this.state.countDown}</span> seconds)

          <h4>Confirmation keys</h4>
          Conf key: <span id="conf-key" className="code">{this.state.confKey}</span><br />
          Details key: <span id="details-key" className="code">{this.state.detailsKey}</span><br />
          Allow key: <span id="allow-key" className="code">{this.state.allowKey}</span><br />
          Cancel key: <span id="cancel-key" className="code">{this.state.cancelKey}</span><br />
        </div>

        <div className="footer">
          Version: {packageJson.version}
        </div>
      </div>
    );
  }
})

render((
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>
), document.getElementById('root'))
