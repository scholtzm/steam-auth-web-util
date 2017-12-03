import React from 'react';
import createReactClass from 'create-react-class';
import cloneDeep from 'lodash/cloneDeep';

import { generate } from './utils/totp';
import profile from './utils/profile';

import packageJson from '../package.json';

export default createReactClass({
  _calculate() {
    const { sharedSecret, identitySecret, timestamp, timeOffset } = this.state.profiles[this.state.activeProfile].formData;
    const generatedValues = generate(sharedSecret, identitySecret, timestamp, timeOffset);
    this.setState({ generatedValues });
  },

  _loadFromStorage() {
    const profiles = profile.load();
    if (profiles != null) {
      console.log(this.state.activeProfile);
      let newActiveProfile = this.state.activeProfile;
      if(this.state.activeProfile >= profiles.length) {
        newActiveProfile = 0;
      }

      this.setState({ activeProfile: newActiveProfile, profiles });
    }
  },

  _updateState(updateValue) {
    const profilesClone = cloneDeep(this.state.profiles);
    const formData = Object.assign({}, this.state.profiles[this.state.activeProfile].formData, updateValue);
    profilesClone[this.state.activeProfile].formData = formData;
    this.setState({ profiles: profilesClone });
  },

  _handleSharedSecretChange(event) {
    this._updateState({ sharedSecret: event.target.value });
  },

  _handleIdentitySecretChange(event) {
    this._updateState({ identitySecret: event.target.value });
  },

  _handleTimestampChange(event) {
    this._updateState({ timestamp: event.target.value });
  },

  _handleTimeOffsetChange(event) {
    this._updateState({ timeOffset: event.target.value });
  },

  _handleProfileChange(event) {
    const profileName = event.target.value;
    const profileIndex = this.state.profiles.map(p => p.name).indexOf(profileName);

    if(profileIndex !== -1) {
      this.setState({ activeProfile: profileIndex });
    }
  },

  _onCurrentTimestampClick() {
    const formData = Object.assign({}, this.state.profiles[this.state.activeProfile].formData, { timestamp: Math.floor(Date.now() / 1000) });
    this.setState({ formData });
    this._flashMessage('Set to current unix timestamp.');
  },

  _onDynamicTimestampClick() {
    const formData = Object.assign({}, this.state.profiles[this.state.activeProfile].formData, { timestamp: '' });
    this.setState({ formData });
    this._flashMessage('Set to dynamic.');
  },

  _onSaveClick() {
    const profileName = prompt('Please enter configuration name', 'Default');

    if(profileName != null) {
      const newActiveProfile = profile.save(profileName, this.state.profiles[this.state.activeProfile].formData);
      console.log(newActiveProfile);
      this.setState({ activeProfile: newActiveProfile });
      this._flashMessage('Saved.');
    } else {
      this._flashMessage('Missing profile name.');
    }

    this._loadFromStorage();
  },

  _onClearCurrentClick() {
    profile.clear(this.state.activeProfile);
    this._loadFromStorage();
    this._flashMessage('Deleted current profile.');
  },

  _onClearClick() {
    profile.clear();
    this._loadFromStorage();
    this._flashMessage('Deleted all profiles.');
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

      profiles: [{
        name: 'Default',
        formData: {
          sharedSecret: '',
          identitySecret: '',
          timestamp: '',
          timeOffset: 0,
        },
      }],
      activeProfile: 0,

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
    this._loadFromStorage();
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

    let profiles = (
      <select id="profile-selector" name="profile-selector" onChange={this._handleProfileChange}>
        {this.state.profiles.map(p => <option value={p.name} key={p.name}>{p.name}</option>)}
      </select>
    );

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
              value={this.state.profiles[this.state.activeProfile].formData.sharedSecret}
              onChange={this._handleSharedSecretChange} />
          </div>
          <div className="form-group">
            <label htmlFor="identity-secret">Identity secret:</label>
            <input name="identity-secret"
              type="text"
              value={this.state.profiles[this.state.activeProfile].formData.identitySecret}
              onChange={this._handleIdentitySecretChange} />
          </div>
          <div className="form-group">
            <label htmlFor="fixed-timestamp" title="Leave empty for live timestamp. Used only for confirmations.">Static timestamp:</label>
            <input name="fixed-timestamp"
              type="text"
              value={this.state.profiles[this.state.activeProfile].formData.timestamp}
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
              value={this.state.profiles[this.state.activeProfile].formData.timeOffset}
              onChange={this._handleTimeOffsetChange} />
          </div>
          <div className="form-group">
            <label htmlFor="profile-selector">Profile:</label>
            {profiles}
          </div>
          <div className="form-group">
            <input type="button"
              name="save"
              value="Save to local storage"
              onClick={this._onSaveClick} />
            <input type="button"
              name="clear"
              value="Delete current"
              onClick={this._onClearCurrentClick} />
            <input type="button"
              name="clear"
              value="Delete all"
              onClick={this._onClearClick} />
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
