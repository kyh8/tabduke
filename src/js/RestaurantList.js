const React = require('react');
const Dining = require('../data/dining.json');
const Restaurant = require('./Restaurant');
const RestaurantStatus = require('./RestaurantStatus');
const TimeConstants = require('./TimeConstants');
const Keys = require('../data/keys.json');
const FoodTruck = require('./FoodTruck');
const $ = require('jquery');

const ESTOffset = -4.0;
const ALMOST_CLOSED = 1;

export class RestaurantList extends React.Component {
  constructor(props) {
    super(props);

    const initialTime = this._getCurrentDukeTime();
    this._refreshTime();
    this._fetchFoodTrucks();
    this.state = {
      currentTime: initialTime,
      fetchingFoodTrucks: true,
      foodTrucks: [],
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
          menu={venue.menu}
          {...this.props}/>
      );
      restaurantList.push(restaurant);
    });
    return restaurantList;
  }

  _fetchFoodTrucks() {
    let yesterday = new Date();
    yesterday = new Date(
      new Date(
        yesterday.getTime()
        - TimeConstants.HRS_PER_DAY
        * TimeConstants.MINS_PER_HR
        * TimeConstants.SECS_PER_MIN
        * TimeConstants.MS_PER_SEC
      ).toLocaleDateString()
    );
    let tomorrow = new Date(
      yesterday.getTime()
      + 3
      * TimeConstants.HRS_PER_DAY
      * TimeConstants.MINS_PER_HR
      * TimeConstants.SECS_PER_MIN
      * TimeConstants.MS_PER_SEC
      - TimeConstants.MS_PER_SEC);

    let apiKey = Keys.foodtruckcalendar;
    let calendarId = Keys.foodtruckcalendarID;

    let https = 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events';
    let request = $.ajax({
      url: https,
      dataType: 'json',
      type: "GET",
      data: {
        key: apiKey,
        timeMin: yesterday.toISOString(),
        timeMax: tomorrow.toISOString(),
        singleEvents:true,
        orderBy:"startTime"
      }
    });
    $.when(request).done((data) => {
      let trucks = [];
      data.items.forEach(function(event){
        let start = new Date(event.start.dateTime);
        let end = new Date(event.end.dateTime);
        let truck = event.summary;
        if(start.toLocaleDateString() == new Date().toLocaleDateString()){
          let truckObj = {
            start: start,
            end: end,
            name: truck
          };
          trucks.push(truckObj);
        }
      });
      this.setState({
        fetchingFoodTrucks: false,
        foodTrucks: trucks,
      });
    });
  }

  _renderFoodTrucks() {
    let foodTruckElements = [];
    this.state.foodTrucks.forEach((truck, index) => {
      let foodTruck = (
        <FoodTruck
          key={'food-truck-list-' + index}
          foodTruck={truck}
          {...this.props}/>
      );
      foodTruckElements.push(foodTruck);
    });
    if (this.state.fetchingFoodTrucks) {
      return (
        <div>
          <i className='fa fa-refresh fa-2x fa-fw loading'/>
        </div>
      );
    } else {
      return foodTruckElements;
    }
  }

  render() {
    return (
      <div className='list-container'>
        <div className='list-header'>
          Food
        </div>
        <div className='food-list'>
          {
            this.state.foodTrucks.length > 0
            ? (
              <div className='food-truck-list'>
                <div className='food-list-header'>
                  <i className="fa fa-truck" aria-hidden="true"></i>
                  &nbsp;
                  Food Trucks
                </div>
                {this._renderFoodTrucks()}
              </div>
            ) : null
          }
          <div className='restaurant-list'>
            <div className='food-list-header'>
              <i className="fa fa-cutlery" aria-hidden="true"></i>
              &nbsp;
              Restaurants
            </div>
            {this._renderRestaurantList()}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = RestaurantList;
