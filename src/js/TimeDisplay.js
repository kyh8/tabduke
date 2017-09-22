const React = require('react');
const TimeConstants = require('./TimeConstants');
const TimeUtils = require('./TimeUtils');

export class TimeDisplay extends React.Component {
  constructor(props) {
    super(props);

    setInterval(() => {
      this._setTime();
    }, 0.5 * TimeConstants.MS_PER_SEC);

    const initialDate = this._getDate();

    const initialTime = TimeUtils.getTimeString(
      new Date(),
      this.props.dashboardSettings.options.showSeconds.value == 'true',
      this.props.dashboardSettings.options.militaryTime.value == 'true',
    );
    this.state = {
      time: initialTime,
      date: initialDate,
    }
  }

  _setTime() {
    const time = TimeUtils.getTimeString(
      new Date(),
      this.props.dashboardSettings.options.showSeconds.value == 'true',
      this.props.dashboardSettings.options.militaryTime.value == 'true',
    );
    const date = this._getDate();
    this.setState({
      time: time,
      date: date,
    });
  }

  _getDate() {
    const date = new Date();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    const displayDate =
      TimeConstants.DAYS[dayOfWeek] + ', '
      + TimeConstants.MONTHS[month] + ' '
      + dayOfMonth;
    return displayDate;
  }

  render() {
    return (
      <div className='time-display-container'>
        <div className={
          this.props.dashboardSettings.options.boldClock.value == 'true'
          ? 'time-display bold'
          : 'time-display'
        }>
          {this.state.time}
        </div>
        <div className='date-display'>
          {this.state.date}
        </div>
      </div>
    );
  }
}

module.exports = TimeDisplay;
