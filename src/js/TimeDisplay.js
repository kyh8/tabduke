const React = require('react');

const MS_PER_SEC = 1000;
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export class TimeDisplay extends React.Component {
  constructor(props) {
    super(props);

    setInterval(() => {
      this._setTime();
    }, MS_PER_SEC);

    const initialDate = this._getDate();

    const initialTime = this._getTime();
    this.state = {
      time: initialTime,
      date: initialDate,
    }
  }

  _setTime() {
    const time = this._getTime();
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
      DAYS[dayOfWeek] + ', '
      + MONTHS[month] + ' '
      + dayOfMonth;
    return displayDate;
  }

  _getTime() {
    const time = new Date();
    const hours =
      time.getHours() < 10
      ? '0' + time.getHours()
      : time.getHours();
    const minutes =
      time.getMinutes() < 10
      ? '0' + time.getMinutes()
      : time.getMinutes();
    const seconds =
      time.getSeconds() < 10
      ? '0' + time.getSeconds()
      : time.getSeconds();
    const displayTime = hours + ':' + minutes + ':' + seconds;
    return displayTime;
  }

  render() {
    return (
      <div className='time-display-container'>
        <div className='time-display'>
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
