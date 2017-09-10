const React = require('react');
const Dining = require('../data/dining.json');
const Restaurant = require('./Restaurant');
const RestaurantStatus = require('./RestaurantStatus');
const TimeConstants = require('./TimeConstants');

const ESTOffset = -4.0;
const ALMOST_CLOSED = 1;

export class RestaurantList extends React.Component {
  constructor(props) {
    super(props);

    const initialTime = this._getCurrentDukeTime();
    this._refreshTime();
    this.state = {
      currentTime: initialTime,
    };
  }

  _refreshTime() {
    setInterval(() => {
      const newTime = this._getCurrentDukeTime();
      this.setState({
        currentTime: newTime,
      });
    }, TimeConstants.MS_PER_SEC);
  }

  _getTimeInMS(time) {
    let today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today.getTime() + time
    * TimeConstants.MS_PER_SEC
    * TimeConstants.SECS_PER_MIN
    * TimeConstants.MINS_PER_HR;
  }

  _getCurrentDukeTime() {
    let now = new Date();
    let UTCTime = now.getTime()
      + now.getTimezoneOffset()
      * TimeConstants.SECS_PER_MIN
      * TimeConstants.MS_PER_SEC;
    let dukeTime = new Date(
      UTCTime
      + ESTOffset
      * TimeConstants.MS_PER_SEC
      * TimeConstants.SECS_PER_MIN
      * TimeConstants.MINS_PER_HR
    ).getTime();
    return dukeTime;
  }

  _renderRestaurantList() {
    const venues = Dining.venues;
    const today = new Date().getDay();
    const dayName = TimeConstants.DAYS[today];
    let restaurantList = [];
    venues.forEach((venue, i) => {
      let status = RestaurantStatus.CLOSED;
      let start;
      let end;
      if (venue.open) {
        const openTimes = venue.open[dayName];
        if (openTimes) {
          openTimes.forEach((opening) => {
            const startTime = this._getTimeInMS(opening[0]);
            const endTime = this._getTimeInMS(opening[1]);
            const currentTime = this.state.currentTime;
            if (currentTime >= startTime && currentTime < endTime) {
              if (endTime - currentTime
                < ALMOST_CLOSED
                * TimeConstants.MS_PER_SEC
                * TimeConstants.SECS_PER_MIN
                * TimeConstants.MINS_PER_HR
              ) {
                status = RestaurantStatus.CLOSING;
              } else {
                status = RestaurantStatus.OPEN;
              }
              start = startTime;
              end = endTime;
            }
          });
        }
      } else if (venue.alwaysOpen === true) {
        status = RestaurantStatus.ALWAYS_OPEN;
      }

      let restaurant = (
        <Restaurant
          key={'restaurant-' + i}
          name={venue.name}
          status={status}
          startTime={start}
          endTime={end}
          menu={venue.menu}/>
      );
      restaurantList.push(restaurant);
    });
    return restaurantList;
  }

  render() {
    return (
      <div className='list-container'>
        <div className='list-header'>
          <i className="fa fa-cutlery" aria-hidden="true"></i>
          <div>{'Restaurants'}</div>
        </div>
        <div className='restaurant-list'>
          {this._renderRestaurantList()}
        </div>
      </div>
    );
  }
}

module.exports = RestaurantList;
