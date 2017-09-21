const React = require('react');
const RestaurantStatus = require('./RestaurantStatus');
const TimeUtils = require('./TimeUtils');

export class Restaurant extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let statusLabel;
    if (this.props.status === RestaurantStatus.OPEN) {
      statusLabel = 'Open Now';
    } else if (this.props.status === RestaurantStatus.CLOSING) {
      statusLabel = 'Closing Soon';
    } else if (this.props.status === RestaurantStatus.CLOSED) {
      statusLabel = 'Closed';
    } else if (this.props.status === RestaurantStatus.ALWAYS_OPEN) {
      statusLabel = 'Always Open'
    }

    let closingTime = '';
    let closingTimeDisplay = null;
    if (
      this.props.status === RestaurantStatus.OPEN
      || this.props.status === RestaurantStatus.CLOSING
    ) {
      let startTime = TimeUtils.getTimeString(new Date(this.props.startTime), false);
      let endTime = TimeUtils.getTimeString(new Date(this.props.endTime), false);
      closingTime = startTime + ' - ' + endTime;
      closingTimeDisplay = (
        <div className='restaurant-status-closing-time'>
          {closingTime}
        </div>
      );
    }

    return (
      <div className={'restaurant'}>
        <a href={this.props.menu}>
          <div className='restaurant-info'>
            <i className="fa fa-info-circle" aria-hidden="true"/>
          </div>
        </a>
        <div className='restaurant-label'>
          <div className='restaurant-name'>
            {this.props.name}
          </div>
          <div className='restaurant-status-label'>
            <div className={'restaurant-status ' + this.props.status}>
              {statusLabel}
            </div>
            {closingTimeDisplay}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Restaurant;
