const React = require('react');
const TimeUtils = require('./TimeUtils');

export class FoodTruck extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let timeRange = '';
    let startString = TimeUtils.getTimeString(
      new Date(this.props.foodTruck.start),
      false,
      this.props.dashboardSettings.options.militaryTime.value == 'true',
    );
    let endString = TimeUtils.getTimeString(
      new Date(this.props.foodTruck.end),
      false,
      this.props.dashboardSettings.options.militaryTime.value == 'true',
    );
    timeRange += startString + ' - ' + endString;
    return (
      <div className={'food-truck'}>
        <div className='food-truck-label'>
          {this.props.foodTruck.name}
        </div>
        <div className='food-truck-times'>
          {timeRange}
        </div>
      </div>
    );
  }
}

module.exports = FoodTruck;
