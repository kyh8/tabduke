/**
 * Resources:
 * Campus restaurant schedules obtained from Duke Student Affairs at https://studentaffairs.duke.edu/dining
 * Bus times obtained from TransLoc™ API
 * Food Truck Times pulled from Duke Dining's Google Calendar using the Google API
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

    var eventsToShow = [];
    var todaysEvents = [];
    var events = templates.settings.get('events');
    var classes = events.Class;
    var dayAbbrev = {
        'Su':'Sunday',
        'M':'Monday',
        'T':'Tuesday',
        'W':'Wednesday',
        'Th':'Thursday',
        'F':'Friday',
        'S':'Saturday'
    }
    classes.forEach(function(course){
        course.meetingTimes.forEach(function(time){
            time.days.forEach(function(day){
                if(dayAbbrev[day] == dayOfWeek){
                    //console.log(course.course);
                    todaysEvents.push({
                        type:'Class',
                        course: course.course,
                        location: course.location,
                        time: {
                            start: time.start,
                            end: time.end
                        },
                        object: course
                    });
                }
            });
        });
    });

    if(today != currentDate){
        document.getElementById('date').innerText = today;

        var other = events.Other;
        other.forEach(function(event){
            var daysLeft = calculateDaysLeft(currentTime, event.date.month, event.date.day, event.date.year);

            console.log(daysLeft + "d to: " + event.label);
            if(daysLeft == 0){
                todaysEvents.push({
                    type:'Other',
                    label: event.label,
                    start: event.startTime.hours + ':' + event.startTime.minutes + ' ' + event.startTime.half,
                    end: event.endTime.hours + ':' + event.endTime.minutes + ' ' + event.endTime.half,
                    object: event
                });
            }
            else if (daysLeft < 0) {
                var update = {};
                update['events.Other.'+other.indexOf(event)+'.past'] = true;
                templates.settings.set(update);
            }
            else{
                eventsToShow.push({
                    type:'Other',
                    label: event.label,
                    timeUntil: daysLeft+'d',
                    object: event
                });
            }
        });
        var assignments = events.Assignment;
        assignments.forEach(function(assignment){
            var daysLeft = calculateDaysLeft(currentTime, assignment.dueDate.month, assignment.dueDate.day, assignment.dueDate.year);
            console.log(daysLeft + "d to: " + assignment.description + ' for: ' + assignment.course);
            if(daysLeft == 0){
                todaysEvents.push({
                    type:'Assignment',
                    description: assignment.description,
                    course: assignment.course,
                    object: assignment
                });
            }
            else if (daysLeft < 0) {
                var update = {};
                update['events.Assignment.'+assignments.indexOf(assignment)+'.past'] = true;
                templates.settings.set(update);
            }
            else{
                eventsToShow.push({
                    type:'Assignment',
                    description: assignment.description,
                    course: assignment.course,
                    timeUntil: daysLeft+'d',
                    object: assignment
                });
            }
        });

        console.log(eventsToShow);
        console.log(todaysEvents);

        //document.getElementById('food-trucks-loading').style.display = '';
        templates.infoBox.set('finishedLoading', false);
        ////console.log('today: ' + today);
        var yesterday = new Date();
        yesterday = new Date(new Date(yesterday.getTime()-24*60*60*1000).toLocaleDateString());
        //console.log(yesterday);
        var tomorrow = new Date(yesterday.getTime() + 3*24*60*60*1000-1000);
        //console.log(tomorrow);

        var apiKey = 'AIzaSyDdn7SeJJe79wDWrOsOgYDVffsoNySvScI';
        var calendarId = 'vgkckpl2e04dgvbtn94u1jeuk0%40group.calendar.google.com';

        var https = 'https://www.googleapis.com/calendar/v3/calendars/' + calendarId + '/events';
        var request = $.ajax({
            url: https,
            dataType: 'json',
            type: "GET",
            data:{
                key: apiKey,
                timeMin: yesterday.toISOString(),
                timeMax: tomorrow.toISOString(),
                singleEvents:true,
                orderBy:"startTime"
            }
        });
        $.when(request).done(function(data){
            //document.getElementById('food-trucks-loading').style.display = 'none';
            templates.infoBox.set('finishedLoading', true);
            //console.log(data);
            var trucks = [];
            data.items.forEach(function(event){
                var start = new Date(event.start.dateTime);
                var startString = formatTime(start, MILITARY_TIME, false);
                var end = new Date(event.end.dateTime);
                var endString = formatTime(end, MILITARY_TIME, false);
                var truck = event.summary;
                if(truck.indexOf('-Chapel') != -1){
                    truck = truck.substring(0,truck.indexOf('-Chapel'));
                }
                if(start.toLocaleDateString() == currentTime.toLocaleDateString()){
                    var truckObj = {
                        start:startString,
                        end:endString,
                        truck:truck
                    };
                    trucks.push(truckObj);
                }
            });
            templates.infoBox.set('trucks', trucks);
        });
    }

    setTimeout(function(){
        startTime();
    }, 500);
}

function calculateDaysLeft(currentTime, eventMonth, eventDate, eventYear){
    var month = currentTime.getMonth()+1;
    var date = currentTime.getDate();
    var year = currentTime.getFullYear();

    var daysInMonths = templates.settings.get('numDays');
    var monthsUntil = eventMonth - month;

    var yearsUntil = eventYear - year;
    if(new Date(month + '/' + date + '/' + year).getTime() > new Date(eventMonth + '/' + eventDate + '/' + eventYear).getTime()){
        return -1;
    }
    var daysLeft = 0;
    if(yearsUntil > 0){
        daysLeft += daysInMonths[month-1] - date;
        console.log(daysLeft);
        for(var i = month; i < 12; i++){
            daysLeft += daysInMonths[i];
            console.log(daysLeft);
        }
        year++;
        yearsUntil = eventYear - year;
        for(var i = 0; i < yearsUntil; i++){
            daysLeft += 365;
            console.log(daysLeft);
        }
        for(var i = 0; i < eventMonth-1; i++){
            daysLeft += daysInMonths[i];
            console.log(daysLeft);
        }
        daysLeft += eventDate;
        console.log(daysLeft);
    } else {
        if(monthsUntil > 0){
            daysLeft += daysInMonths[month-1] - date;
            console.log(daysLeft);
            for(var i = month; i < eventMonth-1; i++){
                daysLeft += daysInMonths[i];
            }
            daysLeft += eventDate;
            console.log(daysLeft);
        } else if(monthsUntil == 0){
            daysLeft += eventDate - date;
            console.log(daysLeft);
        }
    }
    return daysLeft;
}

function formatTime(date, military, showSeconds){
    //console.log('before: ' + date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var half = date.toLocaleTimeString().split(' ')[1];
    var string = '';
    if(!military){
        if(half == 'PM' && hours != 12){
            hours -= 12;
        }
        if(half == 'AM' && hours == 12){
            hours += 12;
        }
    }
    string += hours + ':';
    if(minutes < 10){
        string += '0';
    }
    string += minutes;
    if(showSeconds){
        string += ':' + seconds;
    }
    if(!military){
        string += ' ' + half;
    }
    //console.log(string);
    return string;
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
            $('#info-box-display').fadeIn(delay);
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
    Ractive.DEBUG = false;
    initializeBackground();
    initializeDining();

    //chrome.storage.sync.clear();
    chrome.storage.sync.get(function(obj){
        //console.log('storage:');
        //console.log(obj);
        setupLinksTemplate();

        var defaults = [];
        defaultLinks.forEach(function(link){
            defaults.push(link);
        });

        if(!obj.displayedLinks){
            templates.links.set('links', defaults);
            //console.log('default links');
        }
        else{
            templates.links.set('links', obj.displayedLinks);
            //console.log('loaded links');
        }

        // initializing settings
        var switches = {};
        if(!obj.settingSwitches) {
            switches = SWITCHES;
            //console.log('initialize');
            //console.log(SWITCHES);
            chrome.storage.sync.set({'settingSwitches':switches});
        }
        else {
            //switches
            switches = obj['settingSwitches'];
            //console.log('set it to this?');
            //console.log(obj);
        }

        var createdLinks = [];
        if(!obj.createdLinks){
            createdLinks = defaults;
            //console.log('default links for the link manager');
        }
        else {
            createdLinks = obj.createdLinks;
            if(obj.linkOrder){
                var temp = [];
                obj.linkOrder.forEach(function(index){
                    temp.push(createdLinks[index]);
                });
                createdLinks = temp;
                //console.log('specific order');
            }
            //console.log(createdLinks);
            //console.log('loaded link manager');
        }

        setupinfoBoxTemplate();
        if(obj.todos){
            templates.infoBox.set('todos', obj.todos);
        }
        else{
            templates.infoBox.set('todos', []);
        }

        if(obj.infoIndex){
            templates.infoBox.set('index', obj.infoIndex);
        }
        else{
            templates.infoBox.set('index', 0);
        }
        $('.importance').tooltip({
            position: {
                my:"right-5 center",
                at:"left center"
            },
            tooltipClass: "importance-tooltip"
        });

        var isClosed;
        if(Object.keys(obj).indexOf('pulldownClosed') == 0){
            isClosed = false;
        }
        else{
            isClosed = obj.pulldownClosed;
        }
        if(isClosed){
            $('#info-box-table').hide();
            document.getElementById('pulldown-icon').setAttribute('src', 'images/status/arrow-down.png');
        }
        document.getElementById('info-box-pulldown').addEventListener('click', function(){
            isClosed = !isClosed;
            $('#info-box-table').toggle('blind', {easing: 'easeInOutQuart'}, 500, function(){
                if(isClosed){
                    document.getElementById('pulldown-icon').setAttribute('src', 'images/status/arrow-down.png');
                    //$('#info-box-table').hide();
                    //$('#info-box-pulldown').animate({'top':'0px'},500,'easeInOutQuart');
                }
                else {
                    document.getElementById('pulldown-icon').setAttribute('src', 'images/status/arrow-up.png');
                    //$('#info-box-pulldown').animate({'top':'0px'},500,'easeInOutQuart');
                    //$('#info-box-table').show();
                }
                document.getElementById('info-box-table').style.backgroundColor = '';
            });
            chrome.storage.sync.set({'pulldownClosed': isClosed});
        });

        initializeSettings(switches, createdLinks);
        if(obj.events){
            templates.settings.set('events', obj.events);
            console.log('events');
            console.log(obj.events);
        }
        else{
            templates.settings.set('events', {
                'Class':[],
                'Assignment':[],
                'Other':[]
            });
        }
        $('#settings-panel').hide();
        $('#add-link-prompt').hide();
    });

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

function setupinfoBoxTemplate(){
    var lowestIndex = 0;
    var highestIndex = 2;
    var infoBox = new Ractive({
        el: '#info-box-display',
        template: '#info-box-template',
        data: {
            lowestIndex:lowestIndex,
            highestIndex:highestIndex
        }
    });
    templates.infoBox = infoBox;

    infoBox.set('events', []);
    //infoBox.set('todos',[]);
    //infoBox.set('index', 0);
    infoBox.observe('index', function(newValue, oldValue){
        //console.log('shifted to:'+newValue);
        chrome.storage.sync.set({'infoIndex': newValue});
    });

    infoBox.on('deleteTodo', function(event, index, obj){
        var todos = infoBox.get('todos');
        $('#todo-'+index).toggle('drop', 400, function(){
            todos.splice(index,1);
            chrome.storage.sync.set({'todos':todos});
        });
    });

    infoBox.on('finished', function(event, obj){
        //console.log("finished");
        //console.log(obj);
        var update = {};
        update['todos.'+infoBox.get('todos').indexOf(obj)+'.finished'] = !obj.finished;
        infoBox.set(update);
        chrome.storage.sync.set({'todos':infoBox.get('todos')});
    });

    infoBox.on('important', function(event, obj){
        //console.log("important");
        //console.log(obj);
        var update = {};
        update['todos.'+infoBox.get('todos').indexOf(obj)+'.important'] = !obj.important;
        infoBox.set(update);
        chrome.storage.sync.set({'todos':infoBox.get('todos')});
    });

    infoBox.on('newTodo',function(event){
        //console.log(infoBox.get('todoInput'));
        var todos = infoBox.get('todos');
        var input = infoBox.get('todoInput');
        if(input.length > 0){
            todos.push({
                todo:input,
                finished:false,
                important:false
            });
            chrome.storage.sync.set({'todos':todos});
            infoBox.set('todoInput', '');
            $('.importance').tooltip({
                position: {
                    my:"right-5 center",
                    at:"left center"
                },
                tooltipClass: "importance-tooltip"
            });
        }
        event.original.preventDefault();
    });

    infoBox.on('shiftLeft', function(){
        var index = infoBox.get('index');
        if(index > lowestIndex){
            infoBox.set('index', --index);
        }
        $('.importance').tooltip({
            position: {
                my:"right-5 center",
                at:"left center"
            },
            tooltipClass: "importance-tooltip"
        });
    });
    infoBox.on('shiftRight', function(){
        var index = infoBox.get('index');
        if(index < highestIndex){
            infoBox.set('index', ++index);
        }
        $('.importance').tooltip({
            position: {
                my:"right-5 center",
                at:"left center"
            },
            tooltipClass: "importance-tooltip"
        });
    });
}

function initializeDining(){
    var venues = [];
    for(var i = 0; i < DINING.venues.length; i++){
        var venue = {
            "name": DINING.venues[i].name
        };
        if(DINING.venues[i].menu){
            venue.menu = DINING.venues[i].menu;
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

window.onresize = function(){
    offsetClock();
};

function timeToSeconds(hours, minutes, seconds, half){
    var result = 0;
    if(!hours || !minutes || !half){
        return 'ERROR';
    }
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