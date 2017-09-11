const React = require('react');
const Bus = require('./Bus');
const Keys = require('../data/keys.json');
const TimeConstants = require('./TimeConstants');
const $ = require('jquery');

const DUKE_AGENCY_ID = 176;
const DESIRED_STOPS = [
  4146366,
  4098390,
  4098218,
  4098210,
  4098226,
  4098230,
  4117202,
  4188200,
  4188202,
  4195802,
  4158230,
  4195814,
  4189278,
  4195808,
  4098298,
];
const DESIRED_STOP_NAMES = {
  4146366: "Duke Chapel",
  4098390: 'Campus Walk Ave at LaSalle St',
  4098218: "Research Dr at Duke Clinic",
  4098210: "Science Drive Circle",
  4098226: "Flowers Drive (Southbound)",
  4098230: "Flowers Drive (Northbound)",
  4117202: "East Campus Quad",
  4188200: "Campus Dr at Swift Ave (Westbound)",
  4188202: "Campus Dr at Swift Ave (Eastbound)",
  4195802: "Gilbert-Addoms (Westbound)",
  4158230: "Smith Warehouse (Westbound)",
  4195814: "Smith Warehouse (Eastbound)",
  4189278: "Campus/Anderson (Westbound)",
  4195808: "Campus/Anderson (Eastbound)",
  4098294: "Alexander Ave at Pace St (Eastbound)",
};
const STOP_ORDER = [
  "Duke Chapel",
  "East Campus Quad",
  "Alexander Ave at Pace St (Eastbound)",
  "Campus Walk Ave at LaSalle St'",
  "Research Dr at Duke Clinic",
  "Science Drive Circle",
  "Gilbert-Addoms (Westbound)",
  "Smith Warehouse (Eastbound)",
  "Smith Warehouse (Westbound)",
  "Campus/Anderson (Eastbound)",
  "Campus/Anderson (Westbound)",
  "Flowers Drive (Southbound)",
  "Flowers Drive (Northbound)",
  "Campus Dr at Swift Ave (Eastbound)",
  "Campus Dr at Swift Ave (Westbound)",
];
const BUS_REFRESH = TimeConstants.SECS_PER_MIN;

export class BusList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buses: {},
      stops: [],
      isLoading: false,
      waitedLong: false,
    };
  }

  componentDidMount() {
    this._fetchBusData();
    setInterval(() => {
      this._fetchBusData();
    }, BUS_REFRESH * TimeConstants.MS_PER_SEC);
  }

  _fetchBusData() {
    this.setState({
      isLoading: true,
      waitedLong: false,
    }, () => {
      const routes = $.ajax({
          beforeSend: function(request){
              request.setRequestHeader('X-Mashape-Key', Keys.transloc);
          },
          dataType:"json",
          url:
            'https://transloc-api-1-2.p.mashape.com/routes.json?agencies='
            + DUKE_AGENCY_ID
            + '&callback=call'
      });

      let activeBuses = {};
      let arrivalsAtStop = {};

      $.when(routes).done((response) => {
        const routeList = response.data[DUKE_AGENCY_ID];
        for(var i = 0; i < routeList.length; i++){
          if(routeList[i].is_active){
            activeBuses[routeList[i].route_id] = {
              "name": routeList[i].long_name,
              "color": routeList[i].color,
              "stops": routeList[i].stops,
            };
          }
        }

        let routesRequest = '';
        const activeBusIDs = Object.keys(activeBuses);
        activeBusIDs.forEach((id) => {
          routesRequest += id;
          if(activeBusIDs.indexOf(id) != activeBusIDs.length - 1){
              routesRequest += '%2C';
          }
        });

        let stopsRequest = '';
        DESIRED_STOPS.forEach((id) => {
          stopsRequest += id;
          if(DESIRED_STOPS.indexOf(id) != DESIRED_STOPS.length - 1){
            stopsRequest += '%2C';
          }
        });

        var arrivals = $.ajax({
          beforeSend: (request) => {
            request.setRequestHeader('X-Mashape-Key', Keys.transloc);
          },
          dataType:"json",
          url:
            'https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies='
            + DUKE_AGENCY_ID
            + '&callback=call'
            + '&routes=' + routesRequest
            + '&stops=' + stopsRequest
       });

       $.when(arrivals).done((response) => {
         response.data.forEach((item) => {
           const arrivalList = item.arrivals;
           const busesArriving = [];
           arrivalList.forEach((bus) => {
             busesArriving.push({
               name: activeBuses[bus.route_id].name,
               color: activeBuses[bus.route_id].color,
               arrival: bus.arrival_at,
             });
           });

           arrivalsAtStop[DESIRED_STOP_NAMES[item.stop_id]] = {
             routes: busesArriving,
           };
         });

         let arrivalEstimates = {};
         let currentTime = new Date();
         for (let stop in arrivalsAtStop) {
           if (!arrivalEstimates[stop]) {
             arrivalEstimates[stop] = {};
           }

           let routes = arrivalsAtStop[stop].routes;
           routes.forEach((route) => {
             if (!arrivalEstimates[stop][route.name]) {
               arrivalEstimates[stop][route.name] = {
                 arrivals: [],
               }
             }

             let arrival = new Date(route.arrival);
             let fromNow = arrival.getTime() - currentTime.getTime();
             let minutesFromNow = Math.floor(
               (fromNow / TimeConstants.MS_PER_SEC) / TimeConstants.SECS_PER_MIN
             );

             arrivalEstimates[stop][route.name].arrivals.push(minutesFromNow);
             arrivalEstimates[stop][route.name].color = route.color;
           });
         }

         let stops = [];
         let buses = {};
         for (let stop in arrivalEstimates) {
           let routes = arrivalEstimates[stop];
           stops.push(stop);
           buses[stop] = [];
           for (let route in routes) {
             let times = routes[route].arrivals;
             if (times.length > 2) {
               times = [times[0], times[1]];
             } else if (times.length == 0) {
               times = ['Out of Service'];
             }

             let timeString = '';
             for (let i = 0; i < times.length; i++) {
               if (times[i] <= 0) {
                 times[i] = '<1';
               }
               timeString += times[i];
               if (i < times.length - 1) {
                 timeString += ' & ';
               }
             }
             timeString += ' min.';

             buses[stop].push({
               route: route,
               times: timeString,
               color: '#' + routes[route].color,
             });
           }
         }
         let orderedStops = [];
         STOP_ORDER.forEach((stop) => {
           if (stops.indexOf(stop) != -1) {
             orderedStops.push(stop);
           }
         });
         this.setState({
           isLoading: false,
           buses: buses,
           stops: orderedStops,
         });
       });
     });
    });
  }

  _renderBusList() {
    if (this.state.isLoading) {
      return this._renderLoader();
    } else {
      let stops = {};
      Object.keys(this.state.buses).forEach((stopName, stopIndex) => {
        let stop = this.state.buses[stopName];
        let stopHeader = (
          <div className='bus-stop-section-header'>
            <i className="fa fa-map-marker" aria-hidden="true"/>
            <div>{stopName}</div>
          </div>
        );
        let buses = [];
        stop.forEach((bus, busIndex) => {
          buses.push(
            <Bus
              key={'bus-' + stopIndex + '-' + busIndex}
              name={bus.route}
              color={bus.color}
              times={bus.times}
            />
          );
        });
        let stopSection = (
          <div key={'stop-' + stopIndex} className='bus-stop-section'>
            {stopHeader}
            <div className='bus-stop-section-container'>
              {buses}
            </div>
          </div>
        );
        stops[stopName] = stopSection;
      });

      let stopsToDisplay = [];
      this.state.stops.forEach((stopName) => {
        stopsToDisplay.push(stops[stopName]);
      });
      return stopsToDisplay;
    }
  }

  _renderLoader() {
    setTimeout(() => {
      this.setState({
        waitedLong: true,
      });
    }, 5 * TimeConstants.MS_PER_SEC);
    let prompt;
    if (this.state.waitedLong) {
      prompt = (
        <div className='bus-list-loading-long'>
          Reload or check your connection.
        </div>
      );
    }

    return (
      <div className='bus-list-loading'>
        <i className='fa fa-refresh fa-2x fa-fw loading'/>
        {prompt}
      </div>
    );
  }

  render() {
    const note = (
      <div className='bus-list-note'>
        {'Refreshes every minute. Powered by '}
        <a href={'https://duke.transloc.com/'}>
          {'transloc.'}
        </a>
      </div>
    );
    return (
      <div className='list-container'>
        <div className='list-header'>
          <i className="fa fa-bus" aria-hidden="true"></i>
          <div>{'Buses'}</div>
        </div>
        <div className='bus-list'>
          {this._renderBusList()}
          {!this.state.isLoading && this.state.stops.length > 0 ? note : null}
          {
            !this.state.isLoading && this.state.stops.length == 0
            ? (
              <div className='bus-list-empty'>
                No Buses Running
                <div className='duke-vans'>
                  {'Call 919-684-2020 for Duke Vans'}
                </div>
              </div>
            )
            : null
          }
        </div>
      </div>
    );
  }
}

module.exports = BusList;
