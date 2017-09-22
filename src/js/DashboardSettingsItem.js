const React = require('react');
const SettingsSectionConstants = require('./SettingsSectionConstants');

export class DashboardSettingsItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOn: props.option.value == 'true',
    }
  }

  _toggleSwitch() {
    const newState = !this.state.isOn;
    this.setState({
      isOn: newState,
    }, () => {
      this.props.updateSettings(
        SettingsSectionConstants.OPTIONS,
        this.props.settingIndex,
        newState
      );
    });
  }

  render() {
    return (
      <div className='dashboard-settings-item'>
        <div
          className={
            this.state.isOn
            ? 'settings-item-switch-container enabled'
            : 'settings-item-switch-container disabled'
          }
          onClick={this._toggleSwitch.bind(this)}>
          <div className='settings-item-switch'/>
        </div>
        <div className='dashboard-settings-item-label'>
          {this.props.option.label}
        </div>
      </div>
    );
  }
}

module.exports = DashboardSettingsItem;
