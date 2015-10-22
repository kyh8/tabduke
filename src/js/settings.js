var defaultType = 'Select a type...';
function initializeSettings(switches, createdLinks){
    var settingsRactive = new Ractive({
        el: '#settings',
        template: '#settings-template',
        data:{
            open: false,
            tabs:['Settings', 'Links', 'Events'],
            tabIndex:0,
            eventTypes:[
                'Class', 'Assignment', 'Other'
            ],
            eventColors:{
                'Class': 'lightblue',
                'Assignment': 'red',
                'Other': 'lightgreen',
                'Select a type...':'white'
            },
            selectedEventType:defaultType,
            typeSelectorActive:false,
            displayCloseIcon: 'display:none;',
            displaySettingIcon: '',
            switches: switches,
            initialized:false
        }
    });
    templates.settings = settingsRactive;
    settingsRactive.set('createdLinks', createdLinks);
    chrome.storage.sync.set({'createdLinks':createdLinks});
    var indices = [];
    for(var i = 0; i < createdLinks.length; i++){
        indices.push(i);
    }
    chrome.storage.sync.set({'linkOrder':indices});
    initializeSwitches(switches);
    setupLinkTooltips();
    setupLinkManager();
    settingsRactive.set('tooManyLinks', templates.links.get('links').length >= MAX_NUM_LINKS);
    settingsRactive.set('errors', 0);
    settingsRactive.set('nameError', false);
    settingsRactive.set('urlError', false);
    settingsRactive.set('initialized', true);

    $('#eventTypeDropdown').hide();
    $('#new-event-prompt').hide();
    $('.timeSelect').hide();
    $('#class-selector').hide();
    $('#new-meeting-time-prompt').hide();

    $('#sortable-links').sortable({
        handle:'.link-handle',
        revert: 300,
        stop: function(event, ui){
            var array = $("#sortable-links").sortable("toArray");
            var indices = [];
            //////console.log('indices:');
            array.forEach(function(id){
                var temp = id.split('-');
                indices.push(Number(temp[0]));
            });
            //////console.log(indices);
            var linkObjs = settingsRactive.get('createdLinks');
            //////console.log('objs: ');
            var objs = [];
            indices.forEach(function(index){
                objs.push(linkObjs[index]);
            });
            //console.log(objs);
            reloadLinks(objs);
            chrome.storage.sync.set({'linkOrder':indices});
        }
    });

    var hours = [];
    for(var i = 1; i <= 12; i++){
        hours.push(i);
    }
    var minutes = [];
    for(var i = 0; i <= 60; i+=5){
        if(i < 10){
            minutes.push('0' + i);
        }
        else{
            minutes.push('' + i);
        }
    }
    var months = [];
    for(var i = 1; i <= 12; i++){
        months.push(i);
    }

    var dates = [];
    for(var i = 1; i <= 31; i++){
        dates.push(i);
    }

    var numDays = [31,28,31,30,31,30,31,31,30,31,30,31];
    if(new Date().getFullYear()%4 == 0){
        numDays[1] = 29; // leap year
    }

    var currentYear = new Date().getFullYear();
    var years = [];
    for(var i = currentYear; i < currentYear + 5; i++){
        years.push(i);
    }

    settingsRactive.set('hours', hours);
    settingsRactive.set('minutes', minutes);
    settingsRactive.set('halves', ['AM', 'PM']);
    settingsRactive.set('months', months);
    settingsRactive.set('dates', dates);
    settingsRactive.set('years', years);
    settingsRactive.set('numDays', numDays);
    settingsRactive.set('dueDateYear', currentYear);
    settingsRactive.set('eventDateYear', currentYear);

    settingsRactive.set('suppressed', false);
    $(document).click(function() {
        if(!settingsRactive.get('suppressed')){
            if(settingsRactive.get('typeSelectorActive')){
                $('#eventTypeDropdown').hide('blind', 300);
                settingsRactive.set('typeSelectorActive', !settingsRactive.get('typeSelectorActive'));
            }
            if(settingsRactive.get('courseSelectorActive')){
                $('#class-selector').hide('blind', 300);
                settingsRactive.set('courseSelectorActive', !settingsRactive.get('courseSelectorActive'));
            }
            if(settingsRactive.get('activeTimeSelector').length != 0){
                $('#'+settingsRactive.get('activeTimeSelector')+'-selector').hide('blind', 300);
                document.getElementById(settingsRactive.get('activeTimeSelector')).classList.remove('active');
                settingsRactive.set('activeTimeSelector', '');
            }
        }
    });

    settingsRactive.on('selectEventType', function(event, obj){
        settingsRactive.set('suppressed', true);
        if(settingsRactive.get('courseSelectorActive')){
            $('#class-selector').hide('blind', 300);
            settingsRactive.set('courseSelectorActive', !settingsRactive.get('courseSelectorActive'));
        }
        if(settingsRactive.get('activeTimeSelector').length != 0){
            $('#'+settingsRactive.get('activeTimeSelector')+'-selector').hide('blind', 300);
            document.getElementById(settingsRactive.get('activeTimeSelector')).classList.remove('active');
            settingsRactive.set('activeTimeSelector', '');
        }
        $('#eventTypeDropdown').toggle('blind', 300, function(){
            settingsRactive.set('typeSelectorActive', !settingsRactive.get('typeSelectorActive'));
            if(obj){
                settingsRactive.set('selectedEventType', obj);
            }
            settingsRactive.set('suppressed', false);
        });
    });

    settingsRactive.observe('selectedEventType', function(newValue, oldValue){
        if(!oldValue || newValue == oldValue){
            return;
        }

        if(oldValue == 'Class'){
            resetClassPrompt();
        } else if(oldValue == 'Assignment'){
            resetAssignmentPrompt();
        } else if(oldValue == 'Other'){
            resetOtherPrompt();
        }
    });

    var dayNames = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
    var days = [];
    dayNames.forEach(function(day){
        var obj = {
            day:day,
            selected:false
        };
        days.push(obj);
    });
    settingsRactive.set('daysOfWeek', days);

    var dateSelectors = ['dueDateMonth', 'dueDateDay'];
    var timeSelectors = ['startTimeHour','startTimeMin','startTimeHalf',
        'endTimeHour','endTimeMin','endTimeHalf'
    ];
    var eventTimeSelectors = ['eventStartTimeHour','eventStartTimeMin','eventStartTimeHalf',
        'eventEndTimeHour','eventEndTimeMin','eventEndTimeHalf'];
    settingsRactive.set('dateSelectors', dateSelectors);
    settingsRactive.set('timeSelectors', timeSelectors);
    settingsRactive.set('eventTimeSelectors', eventTimeSelectors);
    settingsRactive.set('courseSelectorActive', false);
    settingsRactive.set('activeTimeSelector', '');
    settingsRactive.on('chooseDay', function(event, day){
        var obj = {};
        obj['daysOfWeek.'+days.indexOf(day) + '.selected'] = !day.selected;
        settingsRactive.set(obj);
        checkValidMeetingTime();
    });

    settingsRactive.set('meetingTimes', []);
    //settingsRactive.set('events', []);
    settingsRactive.set('validMeetingTime', false);
    settingsRactive.set('validEvent', false);
    settingsRactive.set('validDueDate', false);

    settingsRactive.on('addEvent',function(){
        if(settingsRactive.get('validEvent') && settingsRactive.get('selectedEventType') != defaultType){
            var selectedEvent = settingsRactive.get('selectedEventType');
            var events = settingsRactive.get('events');
            var eventList = events[selectedEvent];
            var data = {};
            if(selectedEvent == 'Class'){
                data.course = settingsRactive.get('courseName');
                data.location = settingsRactive.get('location');
                data.meetingTimes = settingsRactive.get('meetingTimes');
            }
            else if(selectedEvent == 'Assignment'){
                data.course = settingsRactive.get('courseFor');
                data.description = settingsRactive.get('description');
                data.dueDate = {
                    month:settingsRactive.get('dueDateMonth'),
                    day:settingsRactive.get('dueDateDay'),
                    year:settingsRactive.get('dueDateYear')
                }
                data.past = false;
            }
            else if(selectedEvent == 'Other'){
                data.label = settingsRactive.get('eventLabel');
                data.location = settingsRactive.get('eventLocation');
                data.date = {
                    month:settingsRactive.get('eventDateMonth'),
                    day:settingsRactive.get('eventDateDay'),
                    year:settingsRactive.get('eventDateYear')
                }
                data.startTime = {
                    hours: settingsRactive.get('eventStartTimeHour'),
                    minutes: settingsRactive.get('eventStartTimeMin'),
                    half: settingsRactive.get('eventStartTimeHalf')
                }
                data.endTime = {
                    hours: settingsRactive.get('eventEndTimeHour'),
                    minutes: settingsRactive.get('eventEndTimeMin'),
                    half: settingsRactive.get('eventEndTimeHalf')
                }
                data.past = false;
            }
            eventList.push(data);
            settingsRactive.set('events', events);
            chrome.storage.sync.set({'events':events});
            closeEventPrompt();
        }
    });

    settingsRactive.on('deleteEvent', function(event, type, index){
        var events = settingsRactive.get('events');
        var typeList = events[type];
        $('#'+type + '-' + index).toggle('drop', 500, function() {
            typeList.splice(index, 1);
            settingsRactive.set('events', events);
            chrome.storage.sync.set({'events':events});
        });
    });

    settingsRactive.on('cancelAddEvent', function(){
        closeEventPrompt();
    });

    settingsRactive.observe('courseName', function(newValue, oldValue){
        checkValidEvent();
    });

    settingsRactive.observe('location', function(newValue, oldValue){
        checkValidEvent();
    });

    settingsRactive.observe('course', function(){
        checkValidEvent();
    });

    settingsRactive.observe('description', function(){
        checkValidEvent();
    });

    settingsRactive.on('addMeetingTime', function(){
        if(settingsRactive.get('validMeetingTime')){
            var meetingTime = createMeetingTime();
            console.log(meetingTime);
            console.log('NEW MEETING TIME');
            var meetingTimes = settingsRactive.get('meetingTimes');
            var temp = [];
            meetingTimes.forEach(function(time){
                temp.push(time);
            });

            settingsRactive.set('validMeetingTime', false);
            $('#new-meeting-time-prompt').fadeOut(400, function(){
                temp.push(meetingTime);
                settingsRactive.set('meetingTimes',temp);
                checkValidEvent();
                resetTimePrompt();
            });
            settingsRactive.set('addMeetingTimeOpen', !settingsRactive.get('addMeetingTimeOpen'));
        }
    });

    settingsRactive.on('cancelMeetingTime', function(){
        $('#new-meeting-time-prompt').fadeOut(400, function(){
            resetTimePrompt();
        });
        settingsRactive.set('addMeetingTimeOpen', !settingsRactive.get('addMeetingTimeOpen'));
    });

    settingsRactive.on('deleteMeetingTime', function(event, index){
        var times = settingsRactive.get('meetingTimes');
        $('#'+index+'-meeting-time').toggle('drop', 500, function() {
            times.splice(index, 1);
            checkValidEvent();
        });
    });

    settingsRactive.on('showClasses', function(event, course){
        settingsRactive.set('suppressed', true);
        if(settingsRactive.get('typeSelectorActive')){
            $('#eventTypeDropdown').hide('blind', 300);
            settingsRactive.set('typeSelectorActive', !settingsRactive.get('typeSelectorActive'));
        }
        if(settingsRactive.get('activeTimeSelector').length != 0){
            $('#'+settingsRactive.get('activeTimeSelector')+'-selector').hide('blind', 300);
            document.getElementById(settingsRactive.get('activeTimeSelector')).classList.remove('active');
            settingsRactive.set('activeTimeSelector', '');
        }
        settingsRactive.set('courseSelectorActive', !settingsRactive.get('courseSelectorActive'));
        $('#class-selector').toggle('blind', 300, function(){
            if(course){
                settingsRactive.set('courseFor', course);
            }
            settingsRactive.set('suppressed', false);
        });
    });

    settingsRactive.on('selectTime', function(event, value, variable){
        console.log(variable);
        settingsRactive.set('suppressed', true);
        if(settingsRactive.get('typeSelectorActive')){
            $('#eventTypeDropdown').hide('blind', 300);
            settingsRactive.set('typeSelectorActive', !settingsRactive.get('typeSelectorActive'));
        }
        if(settingsRactive.get('courseSelectorActive')){
            $('#class-selector').hide('blind', 300);
            settingsRactive.set('courseSelectorActive', !settingsRactive.get('courseSelectorActive'));
        }
        var activeSelector = settingsRactive.get('activeTimeSelector');
        $('#'+variable+'-selector').toggle('blind', 300, function(){
            var selectorObj = document.getElementById(variable);
            if(selectorObj.classList.contains('active')){
                selectorObj.classList.remove('active');
            }
            else{
                selectorObj.classList.add('active');
            }
            if(value && variable){
                settingsRactive.set(variable, value);
                checkValidTime();
                //console.log('variable:'+variable+' set to:'+value);
            }
            settingsRactive.set('suppressed', false);
        });
        if(variable != activeSelector){
            $('#'+activeSelector+'-selector').toggle('blind', 300, function(){
                var selectorObj = document.getElementById(activeSelector);
                if(selectorObj.classList.contains('active')){
                    selectorObj.classList.remove('active');
                }
                else{
                    selectorObj.classList.add('active');
                }
            });
            settingsRactive.set('activeTimeSelector', variable);
        }
        else {
            settingsRactive.set('activeTimeSelector', '');
        }
    });

    settingsRactive.observe('name', function(newValue, oldValue){
        if(settingsRactive.get('tabIndex') != 1){
            return;
        }
        //document.getElementById('preview-alternate').innerText = newValue.charAt(0);
        checkName(newValue, settingsRactive);
    });

    settingsRactive.observe('url', function(newValue, oldValue){
        if(settingsRactive.get('tabIndex') != 1){
            return;
        }
        checkUrl(newValue, settingsRactive);
    });

    settingsRactive.observe('errors', function(newValue, oldValue){
        if(settingsRactive.get('tabIndex') != 1){
            return;
        }
        if(newValue == 0){
            settingsRactive.set('canCreate', true);
            //document.getElementById('create-button').classList.remove('disabled');
        }
        else{
            settingsRactive.set('canCreate', false);
            //document.getElementById('create-button').classList.add('disabled');
        }
    });

    settingsRactive.observe('tabIndex', function(newValue, oldValue){
        if(oldValue == 1){
            settingsRactive.set('addLinkOpen', false);
            $('#add-link-prompt').hide();
            resetFields(settingsRactive);
        }
        else if(oldValue == 2){
            settingsRactive.set('addEventOpen', false);
            $('#new-event-prompt').hide();
            resetEventPrompt();
        }
    });

    settingsRactive.on('switchTab', function(event, index){
        settingsRactive.set('tabIndex', index);
    });

    settingsRactive.observe('militaryTime', function(newValue, oldValue){
        //console.log('military time: ' + newValue);
        var currentTime = new Date();
        var dayOfWeek = days[currentTime.getDay()];
        var time = currentTime.toLocaleTimeString().split(' ');
        var timeComponent = time[0].split(':');
        var hours = timeComponent[0];
        var minutes = timeComponent[1];
        var seconds = timeComponent[2];
        var halfComponent = time[1];

        setVenueStatuses(timeToSeconds(hours, minutes, seconds, halfComponent), dayOfWeek, true);
        var update = {};
        if(templates.infoBox.get('trucks')){
            templates.infoBox.get('trucks').forEach(function(truck){
                var start = truck.start.split(':');
                var end = truck.end.split(':');
                var startHours = Number(start[0]);
                var startMinutes = start[1].substring(0,2);

                var endHours = Number(end[0]);
                var endMinutes = end[1].substring(0,2);
                var startString = '';
                var endString = '';
                if(newValue){
                    startString = (startHours+12) + ':' + startMinutes;
                    endString = (endHours+12) + ':' + endMinutes;
                }
                else{
                    startString = (startHours-12) + ':' + startMinutes + ' PM';
                    endString = (endHours-12) + ':' + endMinutes + ' PM';
                }
                update['trucks.'+templates.infoBox.get('trucks').indexOf(truck)+'.start'] = startString;
                update['trucks.'+templates.infoBox.get('trucks').indexOf(truck)+'.end'] = endString;
            });
            templates.infoBox.set(update);
        }
    });

    settingsRactive.observe('createdLinks', function(newValue, oldValue){
        if(settingsRactive.get('tabIndex') != 1){
            return;
        }
        setupLinkTooltips();
    });

    settingsRactive.on('createLink', function(){
        if(settingsRactive.get('canCreate') && settingsRactive.get('addLinkOpen')){
            //$('#add-button').show();
            $('#add-link-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 600, function(){
                var newLink = {
                    label:settingsRactive.get('name'),
                    enabled:false,
                    disabled:templates.links.get('links').length+1>MAX_NUM_LINKS
                };
                if(settingsRactive.get('imageError')){
                    newLink.text = settingsRactive.get('name').charAt(0);
                    //newLink.showText = '';
                    //newLink.showIcon = 'display:none;';
                    newLink.labelOffset = '7px';
                }
                else{
                    newLink.icon = settingsRactive.get('imageUrl');
                    //newLink.showIcon = '';
                    //newLink.showText = 'display:none;';
                    newLink.labelOffset = '5px';
                }
                var url = settingsRactive.get('url');
                if(!url.startsWith('http://') && !url.startsWith('https://')){
                    newLink.url = 'https://'+url;
                }
                else{
                    newLink.url = url;
                }

                if(newLink.url.length >= 60){
                    newLink.tooltipUrl = newLink.url.substring(0,60) + '...';
                }
                else{
                    newLink.tooltipUrl = newLink.url;
                }
                ////console.log('tooltip url: ' + newLink.tooltipUrl);
                var links = settingsRactive.get('createdLinks');
                links.push(newLink);
                var enabled = newLink.enabled + '';
                //console.log('enabled? ' + newLink.enabled);
                document.getElementById(links.indexOf(newLink) + '-toggle').style.backgroundColor = switchRef.small[enabled].color;
                document.getElementById(links.indexOf(newLink) + '-toggle-ball').style.right = switchRef.small[enabled].offset;
                if(newLink.disabled){
                    document.getElementById((links.length-1) + '-toggle').style.backgroundColor = 'gray';
                    document.getElementById((links.length-1) + '-toggle-ball').style.backgroundColor = 'gray';
                }
                else{
                    document.getElementById((links.length-1) + '-toggle').style.backgroundColor = 'white';
                    document.getElementById((links.length-1) + '-toggle-ball').style.backgroundColor = 'white';
                }
                resetFields(settingsRactive);
                //document.getElementById('add-button').classList.remove('disabled');
                reloadLinks();
                chrome.storage.sync.set({'createdLinks':settingsRactive.get('createdLinks')});
                //if(newLink.label.length > 10){
                //    var row = Math.floor(links.indexOf(newLink)/3);
                //    var col = links.indexOf(newLink)%numColumns;
                //    var id = 'min-label-' + row +'-' + col;
                //    document.getElementById(id).style.fontSize = '10px';
                //}

                $('.min-link-label').tooltip({
                    position: {
                        my:"right-72 center",
                        at:"left center",
                        collision:"fit"
                    },
                    tooltipClass: "min-link-tooltip"
                });
                //if(settingsRactive.get('linkSelected') != 'none'){
                //    deselectLink(settingsRactive.get('linkSelected'));
                //}
                //console.log(templates.links.get('links'));
                settingsRactive.set('addLinkOpen', !settingsRactive.get('addLinkOpen'));
            });
        }
    });

    settingsRactive.on('cancelLink', function(){
        if(settingsRactive.get('addLinkOpen')){
            $('#add-link-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 600, function(){
                resetFields(settingsRactive);
                //document.getElementById('add-button').classList.remove('disabled');
                settingsRactive.set('addLinkOpen', !settingsRactive.get('addLinkOpen'));
            });
        }
    });

    settingsRactive.on('toggleSettings', function(){
        var icon = $('#settings-icon');
        //icon.removeClass('box_rotate box_transition');
        settingsRactive.set('open', !settingsRactive.get('open'));
        if(settingsRactive.get('open')){
            settingsRactive.set('displaySettingIcon', 'display: none;');
            $('#footer').hide();
        }
        else{
            settingsRactive.set('displayCloseIcon', 'display: none;');
        }
        $('#settings-panel').toggle('blind', {'direction': 'left', 'easing': 'easeInOutQuart'}, 500, function(){
            if(settingsRactive.get('open')){
                settingsRactive.set('displayCloseIcon', '');
            }
            else{
                settingsRactive.set('displaySettingIcon', '');
                $('#footer').show();
            }
        });
        //icon.addClass('box_rotate box_transition');
    });

    settingsRactive.on('toggleLinkDisplay', function(event, link){
        //////console.log('toggled?');
        var links = settingsRactive.get('createdLinks');
        var index = links.indexOf(link);
        var toggle = $('#' + index + '-toggle');
        var ball = $('#' + index + '-toggle-ball');
        //////console.log(link);
        if(!link.disabled){
            link.enabled = !link.enabled;
            var enabled = link.enabled + '';
            ball.animate({'right': switchRef.small[enabled].offset}, 200);
            toggle.animate({'background-color': switchRef.small[enabled].color}, 200);
        }
        reloadLinks();
        settingsRactive.set('tooManyLinks', templates.links.get('links').length >= MAX_NUM_LINKS);
        chrome.storage.sync.set({'createdLinks':settingsRactive.get('createdLinks')});
    });

    settingsRactive.observe('tooManyLinks', function(newValue, oldValue){
        if(settingsRactive.get('tabIndex') != 1){
            return;
        }
        checkAndDisable(newValue);
    });

    settingsRactive.on('toggleSwitch', function(event, setting){
        var id = setting;
        ////console.log('clicked: ' + id);
        var switches = settingsRactive.get('switches');
        //////console.log(switches);
        for(var i = 0; i < switches.length; i++){
            if(switches[i].id == id){
                switches[i].on = !switches[i].on;
                var on = switches[i].on + '';
                $('#' + switches[i].id + '-switch-ball').animate({'right': switchRef.normal[on].offset}, 200);
                $('#' + switches[i].id + '-switch').animate({'background-color': switchRef.normal[on].color}, 200);
                //localStorage.setItem(id, switches[i].on);
                chrome.storage.sync.set({'settingSwitches':switches});
                var effectFunction = effectFunctions[switches[i].effect];
                effectFunction(switches[i].on);
                break;
            }
        }
        settingsRactive.set('switches', switches);
    });

    settingsRactive.on('handleImageError', function(){
        handleImageError();
    });

    settingsRactive.on('handleImageLoad', function(){
        handleImageLoad();
    });

    settingsRactive.on('displayNameTip', function(event){
        if(event.hover){
            templates.settings.set('errorTip', "Name must be 1 to 15 characters long.");
        }
        else{
            templates.settings.set('errorTip', '');
        }
    });

    settingsRactive.on('displayUrlTip', function(event){
        if(event.hover){
            templates.settings.set('errorTip', "Please enter a URL.");
        }
        else{
            templates.settings.set('errorTip', '');
        }
    });

    settingsRactive.on('displayImageTip', function(event){
        if(event.hover){
            templates.settings.set('errorTip', "Invalid URL. Don't worry, image is optional.");
        }
        else{
            templates.settings.set('errorTip', '');
        }
    });

    settingsRactive.on('deleteLink', function(event, index, obj){
        var links = settingsRactive.get('createdLinks');
        var displayedLinks = templates.links.get('links');

        $('#'+index+'-sortable-item').toggle('drop', {'easing':'easeOutQuad'}, 500, function(){
            //console.log('before:');
            //console.log(links);
            links.splice(index,1);
            if(obj.enabled){
                displayedLinks.splice(displayedLinks.indexOf(obj),1);
            }
            reloadLinks();
            settingsRactive.set('tooManyLinks', templates.links.get('links').length >= MAX_NUM_LINKS);
            chrome.storage.sync.set({'createdLinks':settingsRactive.get('createdLinks')});
            chrome.storage.sync.set({'displayedLinks':templates.links.get('links')});
        });
    });

    settingsRactive.set('addLinkOpen', false);
    settingsRactive.set('addEventOpen', false);
    settingsRactive.set('addMeetingTimeOpen', false);

    $('#add-button').click(function(){
        if(!settingsRactive.get('addLinkOpen')){
            $('#add-link-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 600);
            settingsRactive.set('addLinkOpen', !settingsRactive.get('addLinkOpen'));
        }
    });

    $('#new-event-button').click(function(){
        if(!settingsRactive.get('addEventOpen')){
            $('#new-event-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 300);
            settingsRactive.set('addEventOpen', !settingsRactive.get('addEventOpen'));
        }
    });

    $('#new-meeting-time-button').click(function(){
        if(!settingsRactive.get('addMeetingTimeOpen')){
            $('#new-meeting-time-prompt').fadeIn(400);
            settingsRactive.set('addMeetingTimeOpen', !settingsRactive.get('addMeetingTimeOpen'));
        }
    });
}

function closeEventPrompt(){
    var settingsRactive = templates.settings;
    if(settingsRactive.get('addEventOpen')){
        $('#new-event-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 600, function(){
            settingsRactive.set('addEventOpen', !settingsRactive.get('addEventOpen'));
            resetEventPrompt();
        });
    }
}

function checkValidEvent(){
    var settingsRactive = templates.settings;
    var courseName = settingsRactive.get('courseName');
    var courseLocation = settingsRactive.get('location');
    var courseMeetingTimes = settingsRactive.get('meetingTimes');

    var course = settingsRactive.get('courseFor');
    var description = settingsRactive.get('description');
    var dueDateMonth = settingsRactive.get('dueDateMonth');
    var dueDateDay = settingsRactive.get('dueDateDay');
    var dueDateYear = settingsRactive.get('dueDateYear');
    var dueDate = new Date((dueDateMonth + '/' + dueDateDay + '/' + dueDateYear));
    var numDays = settingsRactive.get('numDays');

    var eventLabel = settingsRactive.get('eventLabel');
    var eventLocation = settingsRactive.get('eventLocation');
    var eventDateMonth = settingsRactive.get('eventDateMonth');
    var eventDateDay = settingsRactive.get('eventDateDay');
    var eventDateYear = settingsRactive.get('eventDateYear');
    var eventDate = new Date((eventDateMonth + '/' + eventDateDay + '/' + eventDateYear));
    var eventStartTime = timeToSeconds(settingsRactive.get('eventStartTimeHour'), settingsRactive.get('eventStartTimeMin'), 0, settingsRactive.get('eventStartTimeHalf'));
    var eventEndTime = timeToSeconds(settingsRactive.get('eventEndTimeHour'), settingsRactive.get('eventEndTimeMin'), 0, settingsRactive.get('eventEndTimeHalf'));

    if(settingsRactive.get('selectedEventType') == 'Class'){
        settingsRactive.set('validEvent', courseName.length > 0 && courseLocation.length > 0 && courseMeetingTimes.length > 0);
    }
    else if(settingsRactive.get('selectedEventType') == 'Assignment'){
        settingsRactive.set('validEvent', course.length > 0 && description.length > 0
            && dueDateDay <= numDays[dueDateMonth-1] && dueDate.getTime() > new Date().getTime());
    }
    else if(settingsRactive.get('selectedEventType') == 'Other'){
        settingsRactive.set('validEvent', eventLabel.length > 0
            && eventDateDay <= numDays[eventDateMonth-1] && eventDate.getTime() > new Date().getTime()
            && eventStartTime != "ERROR" && eventEndTime != "ERROR" && eventStartTime < eventEndTime);
    }
}

function resetEventPrompt(){
    var settingsRactive = templates.settings;
    var type = settingsRactive.get('selectedEventType');
    if(type == 'Class'){
        resetClassPrompt();
    } else if(type == 'Assignment'){
        resetAssignmentPrompt();
    } else if(type == 'Other'){
        resetOtherPrompt();
    }
    settingsRactive.set('selectedEventType', defaultType);
}

function resetOtherPrompt(){
    var settingsRactive = templates.settings;
    settingsRactive.set('eventLabel', '');
    settingsRactive.set('eventLocation', '');
    settingsRactive.set('eventDateMonth', '');
    settingsRactive.set('eventDateDay', '');
    settingsRactive.set('eventDateYear', new Date().getFullYear());
    var timeSelectors = settingsRactive.get('eventTimeSelectors');
    timeSelectors.forEach(function(selector){
        settingsRactive.set(selector, '');
    });
}

function resetAssignmentPrompt(){
    var settingsRactive = templates.settings;
    settingsRactive.set('courseFor', '');
    settingsRactive.set('description', '');
    settingsRactive.set('dueDateMonth', '');
    settingsRactive.set('dueDateDay', '');
    settingsRactive.set('dueDateYear', new Date().getFullYear());
}

function resetClassPrompt(){
    var settingsRactive = templates.settings;
    settingsRactive.set('courseName', '');
    settingsRactive.set('location', '');
    settingsRactive.set('meetingTimes', []);
}

function resetTimePrompt(){
    var settingsRactive = templates.settings;
    var timeSelectors = settingsRactive.get('timeSelectors');
    timeSelectors.forEach(function(selector){
        settingsRactive.set(selector, '');
        settingsRactive.set('validMeetingTime', false);
    });
    var update = {};
    var days = settingsRactive.get('daysOfWeek');
    for(var i = 0; i < days.length; i++){
        update['daysOfWeek.'+ i + '.selected'] = false;
    }
    settingsRactive.set(update);
}

function checkValidTime(){
    var settings = templates.settings;
    var type = settings.get('selectedEventType');
    if(type == 'Class'){
        checkValidMeetingTime();
    }
    else {
        checkValidEvent();
    }
}

function checkValidMeetingTime(){
    var settingsRactive = templates.settings;
    var meetingTime = createMeetingTime();
    var startTime = timeToSeconds(settingsRactive.get('startTimeHour'), settingsRactive.get('startTimeMin'), 0, settingsRactive.get('startTimeHalf'));
    var endTime = timeToSeconds(settingsRactive.get('endTimeHour'), settingsRactive.get('endTimeMin'), 0, settingsRactive.get('endTimeHalf'));
    if(startTime != "ERROR" && endTime != "ERROR" && meetingTime.days.length > 0 && startTime < endTime){
        settingsRactive.set('validMeetingTime', true);
    } else{
        settingsRactive.set('validMeetingTime', false);
    }
}

function createMeetingTime(){
    var settingsRactive = templates.settings;
    var days = [];
    settingsRactive.get('daysOfWeek').forEach(function(day){
        if(day.selected){
            days.push(day.day);
        }
    });
    var obj = {
        start:settingsRactive.get('startTimeHour')+':'+settingsRactive.get('startTimeMin')+' '+settingsRactive.get('startTimeHalf'),
        end:settingsRactive.get('endTimeHour')+':'+settingsRactive.get('endTimeMin')+' '+settingsRactive.get('endTimeHalf'),
        days:days
    };
    return obj;
}

function checkAndDisable(newValue){
    ////console.log('LETS CHECK: ' + templates.links.get('links').length);
    var array = $("#sortable-links").sortable("toArray");
    var indices = [];
    array.forEach(function(id){
        var temp = id.split('-');
        indices.push(temp[0]);
    });
    //////console.log(indices);
    var linkObjs = templates.settings.get('createdLinks');
    var objs = [];
    //////console.log(linkObjs);
    indices.forEach(function(index){
        objs.push(linkObjs[index]);
    });
    //////console.log(objs);
    var offLinks = [];
    linkObjs.forEach(function(link){
        if(!link.enabled){
            offLinks.push(link);
        }
    });
    //////console.log(offLinks);

    if(newValue){
        ////console.log('too many!');
        offLinks.forEach(function(link){
            link.disabled = true;
        });
    }
    else{
        ////console.log('just right');
        offLinks.forEach(function(link){
            link.disabled = false;
        });
    }

    for(var i = 0; i < objs.length; i++){
        if(objs[i].disabled){
            document.getElementById(indices[i] + '-toggle').style.backgroundColor = 'gray';
            document.getElementById(indices[i] + '-toggle-ball').style.backgroundColor = 'gray';
        }
        else if(!objs[i].enabled){
            document.getElementById(indices[i] + '-toggle').style.backgroundColor = 'white';
            document.getElementById(indices[i] + '-toggle-ball').style.backgroundColor = 'white';
        }
    }
}

function reloadLinks(){
    var array = $("#sortable-links").sortable("toArray");
    var indices = [];
    //////console.log('indices:');
    array.forEach(function(id){
        var temp = id.split('-');
        indices.push(Number(temp[0]));
    });
    chrome.storage.sync.set({'linkOrder':indices});
    //////console.log(indices);
    var linkObjs = templates.settings.get('createdLinks');
    var objs = [];
    indices.forEach(function(index){
        objs.push(linkObjs[index]);
    });
    //////console.log('on-reload');
    //////console.log(objs);
    var result = [];
    objs.forEach(function(link){
        if(link.enabled){
            result.push(link);
        }
    });
    templates.links.set('links', result);
    chrome.storage.sync.set({'displayedLinks':templates.links.get('links')});
}

function setupLinkDefaults(){
    var links = templates.settings.get('createdLinks');
    links.forEach(function(link){
        if(link.defaultLink == true){
            document.getElementById('delete-'+links.indexOf(link)).style.visibility = 'hidden';
        }
    });
}

function handleImageError(){
    var settingsRactive = templates.settings;
    settingsRactive.set('imageError', true);
    document.getElementById('preview').style.display = 'none';
    document.getElementById('preview-alternate').style.display = 'inherit';

    if(settingsRactive.get('imageUrl').length > 0){
        document.getElementById('image-error').style.visibility = 'visible';
    }
    else {
        document.getElementById('image-error').style.visibility = 'hidden';
    }
    if(settingsRactive.get('name').length > 0){
        document.getElementById('preview-alternate').innerText = settingsRactive.get('name').charAt(0);
    }
}

function handleImageLoad(){
    var settingsRactive = templates.settings;
    settingsRactive.set('imageError', false);
    document.getElementById('image-error').style.visibility = 'hidden';
    document.getElementById('preview').style.display = 'inherit';
    document.getElementById('preview-alternate').style.display = 'none';
}

function initializeSwitches(switches){
    switches.forEach(function(setting){
        //////console.log(setting);
        if(setting.id == 'seconds'){
            SHOW_SECONDS = setting.on;
        }
        else if(setting.id == 'fade'){
            DISABLE_FADE_ELEMENTS = setting.on;
        }

        var on = setting.on + '';
        document.getElementById(setting.id+'-switch-ball').style.right = switchRef.normal[on].offset;
        document.getElementById(setting.id+'-switch').style.backgroundColor = switchRef.normal[on].color;
        var effectFunction = effectFunctions[setting.effect];
        //console.log(setting.effect);
        //console.log(effectFunctions);
        effectFunction(setting.on);
        //////console.log('what');
    });

}

function setupLinkTooltips(){
    $('.min-link-label').tooltip({
        position: {
            my:"right-72 center",
            at:"left center",
            collision:"fit"
        },
        tooltipClass: "min-link-tooltip"
    });
}

function setupLinkManager(){
    var links = templates.settings.get('createdLinks');
    //console.log('setting up link manager');
    for(var i = 0; i < links.length; i++) {
        var enabled = links[i].enabled + '';
        document.getElementById(i + '-toggle').style.backgroundColor = switchRef.small[enabled].color;
        document.getElementById(i + '-toggle-ball').style.right = switchRef.small[enabled].offset;
    }
}

function checkName(value, settingsRactive){
    var errors = settingsRactive.get('errors');
    if(value.length == 0 || value.length > 15){
        //document.getElementById('name-error').style.visibility = 'visible';
        if(!settingsRactive.get('nameError')){
            settingsRactive.set('nameError', true);
            errors++;
        }
    }
    else {
        //document.getElementById('name-error').style.visibility = 'hidden';
        if(settingsRactive.get('nameError')){
            settingsRactive.set('nameError', false);
            errors--;
        }
    }
    settingsRactive.set('errors', errors);
}

function checkUrl(value, settingsRactive){
    var errors = settingsRactive.get('errors');
    if(value.length == 0){
        //document.getElementById('url-error').style.visibility = 'visible';
        if(!settingsRactive.get('urlError')){
            settingsRactive.set('urlError', true);
            errors++;
        }
    }
    else{
        //document.getElementById('url-error').style.visibility = 'hidden';
        if(settingsRactive.get('urlError')){
            settingsRactive.set('urlError', false);
            errors--;
        }
    }
    settingsRactive.set('errors', errors);
}

function resetFields(settingsRactive){
    settingsRactive.set('errors', 0);
    settingsRactive.set('imageError', false);
    settingsRactive.set('nameError', false);
    settingsRactive.set('urlError', false);
    settingsRactive.set('name', '');
    settingsRactive.set('url', '');
    settingsRactive.set('imageUrl', '');

    checkName('', settingsRactive);
    checkUrl('', settingsRactive);
}