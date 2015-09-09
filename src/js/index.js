/**
 * Resources:
 * Campus restaurant schedules obtained from Duke Student Affairs at https://studentaffairs.duke.edu/dining
 * Bus times obtained from TransLoc™ API
 *
 * TabDuke
 * Author: Kevin He
 *
 */

var templates = {};
function startTime(){
    var currentTime = new Date();

    var currentDate = document.getElementById('date').innerText;
    var dayOfWeek = days[currentTime.getDay()];
    var today = dayOfWeek + ', ' + months[currentTime.getMonth()] + ' ' + currentTime.getDate();

    var time = currentTime.toLocaleTimeString().split(' ');
    var timeComponent = time[0].split(':');
    var hours = timeComponent[0];
    var minutes = timeComponent[1];
    var seconds = timeComponent[2];
    var halfComponent = time[1];
    if(SHOW_SECONDS == true){
        if(MILITARY_TIME == false){
            document.getElementById('clock').innerText = currentTime.toLocaleTimeString();
        }
        else{
            document.getElementById('clock').innerText = currentTime.getHours() + ':' + minutes + ':' + seconds;
        }
    }
    else {
        if(MILITARY_TIME == false){
            document.getElementById('clock').innerText = hours + ':' + minutes + ' ' + halfComponent;
        }
        else{
            document.getElementById('clock').innerText = currentTime.getHours() + ':' + minutes;
        }
    }
    var timeInSeconds = timeToSeconds(hours, minutes, seconds, halfComponent);
    setVenueStatuses(timeInSeconds, dayOfWeek);

    if(today != currentDate){
        document.getElementById('date').innerText = today;
        ////console.log('today: ' + today);
    }

    setTimeout(function(){
        startTime();
    }, 500);
}

function setVenueStatuses(timeInSeconds, dayOfWeek, forceUpdate){
    for(var i = 0; i < DINING.venues.length; i++){
        var venue = DINING.venues[i].name;
        var open = false;
        var end = 'always';
        if(DINING.venues[i].alwaysOpen){
            open = true;
        }
        else if(!DINING.venues[i].open[dayOfWeek]){
            document.getElementById('status-icon-'+i).setAttribute('src', icons['closed']);
            document.getElementById('venue-status-'+i).setAttribute('title', 'Closed');
            continue;
        }
        else{
            var operationHours = DINING.venues[i].open[dayOfWeek];
            for(var j = 0; j < operationHours.length; j++){
                if(operationHours[j][0] <= timeInSeconds && operationHours[j][1] >= timeInSeconds){
                    open = true;
                    end = operationHours[j][1];
                    break;
                }
            }
        }

        if(open != venueStatuses[venue] || forceUpdate){
            ////console.log('changed: ' + open);
            venueStatuses[venue] = open;
            ////console.log('venue: ' + venue);
            ////console.log('open: ' + open);
            if(open){
                var tooltip = 'Open 24 Hours';
                if(end != 'always'){
                    var hours = Math.floor(end / 3600);
                    end = end % 3600;
                    var minutes = Math.floor(end / 60);
                    if(minutes == 0){
                        minutes = '00';
                    }
                    tooltip = 'Open until ' + hours + ':' + minutes;
                    var half = 'AM';
                    if(hours >= 12){
                        hours -= 12;
                        half='PM';
                    }
                    if(MILITARY_TIME == false){
                        tooltip = 'Open until ' + hours + ':' + minutes + ' ' + half;
                    }
                }

                ////console.log('tooltip: ' + tooltip);
                document.getElementById('status-icon-'+i).setAttribute('src', icons['open']);
                document.getElementById('venue-status-'+i).setAttribute('title', tooltip);
            }
            else{
                document.getElementById('status-icon-'+i).setAttribute('src', icons['closed']);
                document.getElementById('venue-status-'+i).setAttribute('title', 'Closed');
            }
            ////console.log(venueStatuses);
        }
    }
}

function offsetClock(){
    var clock = document.getElementById('time');
    var offset = window.innerHeight*OFFSET_PERCENT;
    clock.style.marginTop = offset + 'px';
}

function initPage(){
    for(var i = 0; i < DINING.venues.length; i++){
        venueStatuses[DINING.venues[i].name] = 'new';
    }

    offsetClock();
    startTime();
    retrieveBusData();
    renderElements();

    chrome.storage.local.get('notificationClosed', function(closed){
        if(Object.keys(closed).length == 0){
            document.getElementById('notification').style.display = '';
        }
    });
}

function setupLinksTemplate(){
    var linkRactive = new Ractive({
        el:'#link-table',
        template:'#link-template',
        data:{}
    });
    templates.links = linkRactive;
}

function renderElements(){
    if(!DISABLE_FADE_ELEMENTS){
        var delay = 400;
        $('#time').fadeIn(delay, function(){
            $('#link-table').animate({opacity:1.0}, delay);
            $('#dining-hours').fadeIn(delay);
            $('#bus-times').fadeIn(delay);
        });
    }
    else{
        document.getElementById('time').style.display = 'inherit';
        document.getElementById('link-table').style.opacity = 1.0;
        document.getElementById('dining-hours').style.display = 'inherit';
        document.getElementById('bus-times').style.display = 'inherit';
    }
}

$(document).ready(function(){
    document.getElementById('close-notification').addEventListener('click', function(){
        $('#notification').fadeOut();
        chrome.storage.local.set({'notificationClosed':true});
    });
    initializeBackground();
    initializeDining();
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (var key in changes) {
            var storageChange = changes[key];
            ////console.log('Storage key "%s" in namespace "%s" changed. ' +
            //    'Old value was "%s", new value is "%s".',
            //    key,
            //    namespace,
            //    storageChange.oldValue,
            //    storageChange.newValue);
            ////console.log('key: ' + key + ' changed. old,new below:');
            ////console.log(storageChange.oldValue);
            ////console.log(storageChange.newValue);
        }
    });
    //chrome.storage.local.clear();
    chrome.storage.local.get(function(obj){
        //console.log('storage:');
        //console.log(obj);
        setupLinksTemplate();

        var defaults = [];
        defaultLinks.forEach(function(link){
            defaults.push(link);
        });

        if(!obj.displayedLinks){
            templates.links.set('links', defaults);
            ////console.log('default links');
        }
        else{
            templates.links.set('links', obj.displayedLinks);
            ////console.log('loaded links');
        }

        // initializing settings
        var switches = {};
        if(!obj.settingSwitches) {
            switches = SWITCHES;
            ////console.log('initialize');
            ////console.log(SWITCHES);
            chrome.storage.local.set({'settingSwitches':switches});
        }
        else {
            //switches
            switches = obj['settingSwitches'];
            ////console.log('set it to this?');
            ////console.log(obj);
        }

        var createdLinks = [];
        if(!obj.createdLinks){
            createdLinks = defaults;
            ////console.log('default links for the link manager');
        }
        else {
            createdLinks = obj.createdLinks;
            if(obj.linkOrder){
                var temp = [];
                obj.linkOrder.forEach(function(index){
                    temp.push(createdLinks[index]);
                });
                createdLinks = temp;
                ////console.log('specific order');
            }
            ////console.log(createdLinks);
            ////console.log('loaded link manager');
        }

        initializeSettings(switches, createdLinks);
        $('#settings-panel').hide();
        $('#add-link-prompt').hide();
    });
    //
    //chrome.storage.local.get('settingSwitches', function(obj){
    //    if(Object.keys(obj).length == 0) {
    //        switches = SWITCHES;
    //        //console.log('initialize');
    //        //console.log(SWITCHES);
    //        chrome.storage.local.set({'settingSwitches':switches});
    //    }
    //    else {
    //        //switches
    //        switches = obj['settingSwitches'];
    //        //console.log('set it to this?');
    //        //console.log(obj);
    //    }
    //    initializeSettings(switches);
    //    $('#settings-panel').hide();
    //    $('#add-link-prompt').hide();
    //});

    $(window).load(function(){
        setTimeout(function(){
            initPage();
            //setup tooltips
            $('.venue-status').tooltip({
                position:{
                    my: 'right center',
                    at: 'left center'
                },
                tooltipClass:'venue-tooltip'
            });
        }, 300);
    });
});

function initializeBackground(){
    var randomNumber = Math.random();
    var index = Math.floor(randomNumber*images.length);
    var ractive = new Ractive({
        el: '#photo-source',
        template: '#source',
        data: {}
    });

    templates.photos = ractive;
    document.body.style.backgroundColor = 'rgba(0,0,0,0.9)';
    $(document.body).css('background-image','url(' + images[index] + ')');
    ractive.set('source', imageSources[images[index]].source);
    ractive.set('link', imageSources[images[index]].link);
}

function initializeDining(){
    var venues = [];
    for(var i = 0; i < DINING.venues.length; i++){
        var venue = {
            "name": DINING.venues[i].name
        };
        if(DINING.venues[i].menu){
            venue.showMenu = '';
            venue.menu = DINING.venues[i].menu;
        }
        else{
            venue.showMenu = 'display: none';
        }
        venues.push(venue);
    }

    var diningRactive = new Ractive({
        el: '#dining',
        template: '#dining-template',
        data: {
            'venues': venues
        }
    });
    templates.dining = diningRactive;
}

//function requestWeather(){
//    var weatherRactive = new Ractive({
//        el: '#weather',
//        template: '#weather-template',
//        data:{}
//    });
//    weatherRactive.set('loadingWeather', '');
//    weatherRactive.set('showWeather', 'display: none');
//
//    if (navigator.geolocation) {
//        navigator.geolocation.getCurrentPosition(getPosition);
//    }
//
//    var position = [];
//    function getPosition(pos) {
//        position = [pos.coords.latitude, pos.coords.longitude];
//        ////console.log(position);
//
//        var weatherRequest = $.getJSON('http://api.openweathermap.org/data/2.5/weather?'+
//            'lat='+position[0]+'&lon='+position[1]+'&units=imperial&APPID=d3d896aef1ccac13159bd2a68b19fe71');
//
//        $.when(weatherRequest).done(function(weather){
//            //console.log(weather);
//            var temp = Math.round(weather.main.temp);
//            var description = weather.weather[0].description;
//            var weatherDescription = '';
//            if(description == 'sky is clear'){
//                weatherDescription = 'Clear Skies';
//            }
//            else{
//                var parsedWeather = description.split(' ');
//                for(var i = 0; i < parsedWeather.length; i++){
//                    parsedWeather[i] = parsedWeather[i].charAt(0).toUpperCase() + parsedWeather[i].slice(1);
//                }
//
//                for(var i = 0; i < parsedWeather.length; i++){
//                    weatherDescription += parsedWeather[i];
//                    if(i != parsedWeather.length-1){
//                        weatherDescription += ' ';
//                    }
//                }
//            }
//            weatherRactive.set('temperature', temp);
//            weatherRactive.set('weather', weatherDescription);
//            weatherRactive.set('icon', 'http://openweathermap.org/img/w/' + weather.weather[0].icon + '.png');
//
//            weatherRactive.set('loadingWeather', 'display: none');
//            weatherRactive.set('showWeather', '');
//        });
//    }
//
//    setTimeout(function(){
//        requestWeather();
//    }, WEATHER_REFRESH_RATE);
//}

window.onresize = function(){
    offsetClock();
};

function timeToSeconds(hours, minutes, seconds, half){
    var result = 0;
    result += hours*60*60;
    result += minutes*60;
    result += seconds*1;
    if(half == "AM" && hours*1 == 12){
        result -= 12*60*60;
    }
    if(half == "PM" && hours*1 != 12){
        result += 12*60*60;
    }
    return result;
}