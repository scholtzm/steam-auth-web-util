import React from 'react';
import createReactClass from 'create-react-class';

import { generate } from './utils/totp';
import profile from './utils/profile';

import packageJson from '../package.json';

export default createReactClass({
  _calculate() {
    const { sharedSecret, identitySecret, timestamp, timeOffset } = this.state.formData;
    const generatedValues = generate(sharedSecret, identitySecret, timestamp, timeOffset);
    this.setState({ generatedValues });
  },

  _handleSharedSecretChange(event) {
    const formData = Object.assign({}, this.state.formData, { sharedSecret: event.target.value });
    this.setState({ formData });
  },

  _handleIdentitySecretChange(event) {
    const formData = Object.assign({}, this.state.formData, { identitySecret: event.target.value });
    this.setState({ formData });
  },

  _handleTimestampChange(event) {
    const formData = Object.assign({}, this.state.formData, { timestamp: event.target.value });
    this.setState({ formData });
  },

  _handleTimeOffsetChange(event) {
    const formData = Object.assign({}, this.state.formData, { timeOffset: event.target.value });
    this.setState({ formData });
  },

  _onCurrentTimestampClick() {
    const formData = Object.assign({}, this.state.formData, { timestamp: Math.floor(Date.now() / 1000) });
    this.setState({ formData });
    this._flashMessage('Set to current unix timestamp.');
  },

  _onDynamicTimestampClick() {
    const formData = Object.assign({}, this.state.formData, { timestamp: '' });
    this.setState({ formData });
    this._flashMessage('Set to dynamic.');
  },

  _onSaveClick() {
    profile.save(this.state.formData);
    this._flashMessage('Saved.');
  },

  _onClearClick() {
    profile.clear();
    this._flashMessage('Cleared.');
  },

  _flashMessage(message, timeout = 3000) {
    this.setState({ message });
    setTimeout(() => {
      this.setState({ message: null });
    }, timeout);
  },

  getInitialState() {
    return {
      message: null,

      formData: {
        sharedSecret: '',
        identitySecret: '',
        timestamp: '',
        timeOffset: 0,
      },

      generatedValues: {
        authCode: '???',
        countDown: '???',
        confKey: '???',
        detailsKey: '???',
        allowKey: '???',
        cancelKey: '???'
      }
    };
  },

  componentWillMount() {
    const formData = profile.load();

    if(formData != null) {
      this.setState({ formData });
    }
  },

  componentDidMount() {
    setInterval(() => {
      this._calculate();
    }, 1000);
    this._calculate();
  },

  render() {
    let message = null;
    if(this.state.message) {
      message = <div className="message">{this.state.message}</div>
    }

    return (
      <div className="container">
        <h1>Steam Auth Web Util</h1>
        <h4>Tiny browser utility to generate Steam auth codes</h4>

        <div className="input">
          {message}
          <div className="form-group">
            <label htmlFor="share-secret">Shared secret:</label>
            <input name="shared-secret"
              type="text"
              value={this.state.formData.sharedSecret}
              onChange={this._handleSharedSecretChange} />
          </div>
          <div className="form-group">
            <label htmlFor="identity-secret">Identity secret:</label>
            <input name="identity-secret"
              type="text"
              value={this.state.formData.identitySecret}
              onChange={this._handleIdentitySecretChange} />
          </div>
          <div className="form-group">
            <label htmlFor="fixed-timestamp" title="Leave empty for live timestamp. Used only for confirmations.">Static timestamp:</label>
            <input name="fixed-timestamp"
              type="text"
              value={this.state.formData.timestamp}
              onChange={this._handleTimestampChange} />
            <button onClick={this._onCurrentTimestampClick}>
              Set current
            </button>
            <button onClick={this._onDynamicTimestampClick}>
              Set dynamic
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="time-offset">Time offset (seconds):</label>
            <input name="time-offset"
              type="number"
              value={this.state.formData.timeOffset}
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
              onClick={this._onClearClick} /><br />
          </div>
        </div>

        <div className="output">
          <h4>SteamGuard</h4>
          <span className="code">{this.state.generatedValues.authCode}</span><br />
          (Expires in <span>{this.state.generatedValues.countDown}</span> seconds)

          <h4>Confirmation keys</h4>
          Conf key: <span className="code">{this.state.generatedValues.confKey}</span><br />
          Details key: <span className="code">{this.state.generatedValues.detailsKey}</span><br />
          Allow key: <span className="code">{this.state.generatedValues.allowKey}</span><br />
          Cancel key: <span className="code">{this.state.generatedValues.cancelKey}</span><br />
        </div>

        <div className="footer">
          Version: {packageJson.version}
        </div>
      </div>
    );
  }
});
