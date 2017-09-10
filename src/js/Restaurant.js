const React = require('react');
const RestaurantStatus = require('./RestaurantStatus');
const TimeUtils = require('./TimeUtils');

export class Restaurant extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipShown: false,
    }
  }

  _tooltipEnter() {
    this.setState({
      tooltipShown: true,
    });
  }

  _tooltipLeave() {
    this.setState({
      tooltipShown: false,
    });
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

    let tooltip;
    if (this.state.tooltipShown) {
      tooltip = (
        <div className='restaurant-info-tooltip'>
          <div className='tooltip-pointer'></div>
          Venue Info
        </div>
      );
    }

    return (
      <div className='restaurant'>
        <a href={this.props.menu}>
          <div className='restaurant-info'>
            {tooltip}
            <i
              className="fa fa-info-circle"
              aria-hidden="true"
              onMouseEnter={this._tooltipEnter.bind(this)}
              onMouseLeave={this._tooltipLeave.bind(this)}/>
          </div>
        </a>
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
