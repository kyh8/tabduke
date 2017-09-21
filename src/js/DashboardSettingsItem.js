const React = require('react');

export class DashboardSettingsItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOn: props.option.value == 'true',
    }
  }

  _toggleSwitch() {
    this.setState({
      isOn: !this.state.isOn,
    });
  }

  render() {
    return (
      <div className='dashboard-settings-item'>
        <div
          className={
            this.state.isOn
            ? 'dashboard-settings-item-switch-container enabled'
            : 'dashboard-settings-item-switch-container disabled'
          }
          onClick={this._toggleSwitch.bind(this)}>
          <div className='dashboard-settings-item-switch'/>
        </div>
        <div className='dashboard-settings-item-label'>
          {this.props.option.label}
        </div>
      </div>
    );
  }
}

module.exports = DashboardSettingsItem;
