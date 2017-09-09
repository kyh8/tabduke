const React = require('react');
const RestaurantStatus = require('./RestaurantStatus');
const TimeUtils = require('./TimeUtils');

export class Restaurant extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props.name, 'is', this.props.status);
    console.log(this.props.startTime, '-', this.props.endTime);

    this.state = {
    }
  }

  render() {
    let statusLabel;
    if (this.props.status === RestaurantStatus.OPEN) {
      statusLabel = 'OPEN NOW';
    } else if (this.props.status === RestaurantStatus.CLOSING) {
      statusLabel = 'CLOSING SOON';
    } else if (this.props.status === RestaurantStatus.CLOSED) {
      statusLabel = 'CLOSED';
    } else if (this.props.status === RestaurantStatus.ALWAYS_OPEN) {
      statusLabel = 'ALWAYS OPEN'
    }

    if (
      this.props.status === RestaurantStatus.OPEN
      || this.props.status === RestaurantStatus.CLOSING
    ) {
      let startTime = TimeUtils.getTimeString(new Date(this.props.startTime), false);
      let endTime = TimeUtils.getTimeString(new Date(this.props.endTime), false);
      statusLabel += ': ' + startTime + ' - ' + endTime;
    }

    return (
      <div className='restaurant'>
        <div className={'restaurant-status ' + this.props.status}/>
        <div className='restaurant-label'>
          <div className='restaurant-name'>
            {this.props.name}
          </div>
          <div className='restaurant-status-label'>
            {statusLabel}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Restaurant;
