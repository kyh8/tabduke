var activeBuses = [];
var activeBusNames = {};

var stopArrivals = {};

function retrieveBusData(){
    var ractive = new Ractive({
        el: '#bus-arrivals',
        template: '#bus-template',
        data: {}
    });

    ractive.set('loading', '');
    ractive.set('noBuses', 'display: none');
    var routes = $.ajax({
        beforeSend: function(request){
            request.setRequestHeader('X-Mashape-Key', '1yByX8ZUaymshdcfSuWsewqQQL4Bp1lj2OVjsnHOiV94rgyRk6');
        },
        dataType:"json",
        url: 'https://transloc-api-1-2.p.mashape.com/routes.json?agencies=' + DUKE_AGENCY_ID + '&callback=call'
    });

    $.when(routes).done(function(response){
        //console.log('routes:');
        //console.log(response.data);
        var routeList = response.data[DUKE_AGENCY_ID];
        for(var i = 0; i < routeList.length; i++){
            if(routeList[i].is_active){
                activeBuses.push(routeList[i].route_id);
                activeBusNames[routeList[i].route_id] = {
                    "name": routeList[i].long_name,
                    "stops": routeList[i].stops
                };
            }
        }
        //console.log(activeBuses);

        var routesRequest = generateRoutesQuery();
        var stopsRequest = generateStopsQuery();
        var arrivals = $.ajax({
            beforeSend: function(request){
                request.setRequestHeader('X-Mashape-Key', '1yByX8ZUaymshdcfSuWsewqQQL4Bp1lj2OVjsnHOiV94rgyRk6');
            },
            dataType:"json",
            url: 'https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=' + DUKE_AGENCY_ID + '&callback=call'
                + '&routes=' + routesRequest + '&stops=' + stopsRequest
        });

        $.when(arrivals).done(function(response){
            //console.log('arrivals:');
            //console.log(response.data);
            for(var i = 0; i < response.data.length; i++){
                var arrivalList = response.data[i].arrivals;
                var busesArriving = [];
                arrivalList.forEach(function(bus){
                    busesArriving.push({
                        "name": activeBusNames[bus.route_id].name,
                        "arrival": bus.arrival_at
                    });
                });

                stopArrivals[desiredStopNames[response.data[i].stop_id]] = {
                    "routes": busesArriving
                }
            }
            //console.log(stopArrivals);

            var arrivalEstimates = {};
            var current = new Date();
            //now we have the arrival estimates
            for(var stop in stopArrivals){
                if(!arrivalEstimates[stop]){
                    arrivalEstimates[stop] = {};
                }
                var routes = stopArrivals[stop].routes;
                routes.forEach(function(route){
                    if(!arrivalEstimates[stop][route.name]){
                        arrivalEstimates[stop][route.name] = [];
                    }
                    var arrival = new Date(route.arrival);
                    var fromNow = arrival.getTime() - current.getTime();
                    var minutesFromNow = Math.floor((fromNow/1000)/60);
                    arrivalEstimates[stop][route.name].push(minutesFromNow);
                });
            }
            //console.log(arrivalEstimates);

            var stops = [];
            var buses = {};
            for(var stop in arrivalEstimates){
                var routes = arrivalEstimates[stop];
                if(altStopNames[stop]){
                    stop = altStopNames[stop];
                }
                stops.push(stop);
                buses[stop] = [];
                for(var route in routes){
                    var times = routes[route];
                    if(times.length > 2){
                        times = [times[0], times[1]];
                    }
                    else if(times.length == 0){
                        times = ['Out of Service'];
                    }
                    var timeString = '';
                    for(var i = 0; i < times.length; i++){
                        if(times[i] == 0){
                            times[i] = '<1';
                        }
                        timeString += times[i];
                        if(i < times.length-1){
                            timeString += ' & ';
                        }
                    }
                    timeString += ' min.'

                    //console.log('color: ' + busColor[route]);
                    buses[stop].push({
                        "route": route,
                        "times": timeString,
                        "color": busColor[route]
                    });
                }
            }
            var temp = [];
            for(var i = 0; i < stopOrder.length; i++){
                if(stops.indexOf(stopOrder[i]) != -1){
                    temp.push(stopOrder[i]);
                }
            }
            ractive.set('loading', 'display: none');
            ractive.set('stops', temp);
            ractive.set('buses', buses);
            //if(temp.length == 0){
            //    ractive.set('noBuses', '');
            //}
            //else{
            //    ractive.set('noBuses', 'display: none');
            //}
            //console.log(ractive.get('stops'));
            //console.log(ractive.get('buses'));
        });

        //var stops = $.ajax({
        //    beforeSend: function(request){
        //        request.setRequestHeader('X-Mashape-Key', '1yByX8ZUaymshdcfSuWsewqQQL4Bp1lj2OVjsnHOiV94rgyRk6');
        //    },
        //    dataType:"json",
        //    url: 'https://transloc-api-1-2.p.mashape.com/stops.json?agencies=176&callback=call'
        //});
        //
        //$.when(stops).done(function(response){
        //    console.log('stops:');
        //    console.log(response);
        //    var stopList = [];
        //    for(var i = 0; i < response.data.length; i++){
        //        //if(desiredStops.indexOf(response.data[i].stop_id) != -1){
        //        //    desiredStopList[response.data[i].stop_id] = response.data[i].name;
        //        //}
        //        stopList.push(response.data[i].name + ': ' + response.data[i].stop_id);
        //    }
        //    console.log(stopList);
        //    //console.log(desiredStopNames);
        //});
    });

    setTimeout(function(){
        retrieveBusData();
    }, BUS_REFRESH_RATE);
}

function generateStopsQuery(){
    var query = '';
    desiredStops.forEach(function(id){
        query += id;
        if(desiredStops.indexOf(id) != desiredStops.length -1){
            query += '%2C';
        }
    });
    return query;
}

function generateRoutesQuery(){
    var query = '';
    activeBuses.forEach(function(id){
        query += id;
        if(activeBuses.indexOf(id) != activeBuses.length -1){
            query += '%2C';
        }
    });
    return query;
}