var numColumns = 3;
function initializeSettings(switches, createdLinks){
    //for(var i = 0; i < SWITCHES.length; i++){
    //    localStorage.removeItem(SWITCHES[i].id);
    //}

    ////console.log('switches: ');
    ////console.log(switches);

    //for(var i = 0; i < SWITCHES.length; i++){
    //    if(!localStorage.getItem(SWITCHES[i].id)){
    //        //////console.log('initialize: ' + SWITCHES[i].id);
    //        SWITCHES[i].on = SWITCHES[i].initial;
    //    }
    //    else{
    //        SWITCHES[i].on = localStorage.getItem(SWITCHES[i].id);
    //        //////console.log('found: ' + localStorage.getItem(SWITCHES[i].id));
    //    }
    //}

    var settingsRactive = new Ractive({
        el: '#settings',
        template: '#settings-template',
        data:{
            open: false,
            displayCloseIcon: 'display:none;',
            displaySettingIcon: '',
            switches: switches
        }
    });
    templates.settings = settingsRactive;
    //var linksRactive = templates.links;
    //var links = linksRactive.get('links');
    //var temp = [];
    //links.forEach(function(link){
    //    temp.push(link);
    //});
    settingsRactive.set('createdLinks', createdLinks);
    //console.log('initialized to:');
    //console.log(createdLinks);
    chrome.storage.local.set({'createdLinks':createdLinks});
    var indices = [];
    for(var i = 0; i < createdLinks.length; i++){
        indices.push(i);
    }
    chrome.storage.local.set({'linkOrder':indices});
    setupLinkTooltips();
    setupLinkDefaults();

    attachErrorListeners(settingsRactive);
    initializeSwitches(switches);

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
            chrome.storage.local.set({'linkOrder':indices});
        }
    });

    setupLinkManager();
    settingsRactive.set('tooManyLinks', templates.links.get('links').length >= MAX_NUM_LINKS);

    settingsRactive.set('errors', 0);
    settingsRactive.set('nameError', false);
    settingsRactive.set('urlError', false);
    settingsRactive.observe('name', function(newValue, oldValue){
        document.getElementById('preview-alternate').innerText = newValue.charAt(0);
        checkName(newValue, settingsRactive);
    });

    settingsRactive.observe('url', function(newValue, oldValue){
        checkUrl(newValue, settingsRactive);
    });

    settingsRactive.observe('errors', function(newValue, oldValue){
        if(newValue == 0){
            settingsRactive.set('canCreate', true);
            document.getElementById('create-button').classList.remove('disabled');
        }
        else{
            settingsRactive.set('canCreate', false);
            document.getElementById('create-button').classList.add('disabled');
        }
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
    });

    settingsRactive.observe('createdLinks', function(newValue, oldValue){
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
                    newLink.showText = '';
                    newLink.showIcon = 'display:none;';
                    newLink.labelOffset = '7px';
                }
                else{
                    newLink.icon = settingsRactive.get('imageUrl');
                    newLink.showIcon = '';
                    newLink.showText = 'display:none;';
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
                document.getElementById('add-button').classList.remove('disabled');
                reloadLinks();
                chrome.storage.local.set({'createdLinks':settingsRactive.get('createdLinks')});
                //if(newLink.label.length > 10){
                //    var row = Math.floor(links.indexOf(newLink)/3);
                //    var col = links.indexOf(newLink)%numColumns;
                //    var id = 'min-label-' + row +'-' + col;
                //    document.getElementById(id).style.fontSize = '10px';
                //}

                $('.min-link-label').tooltip({
                    position: {
                        my:"right-77 center",
                        at:"left center",
                        collision:"fit"
                    },
                    tooltipClass: "min-link-tooltip"
                });
                //if(settingsRactive.get('linkSelected') != 'none'){
                //    deselectLink(settingsRactive.get('linkSelected'));
                //}
                //console.log(templates.links.get('links'));
            });
            settingsRactive.set('addLinkOpen', !settingsRactive.get('addLinkOpen'));
        }
    });

    settingsRactive.on('cancelLink', function(){
        if(settingsRactive.get('addLinkOpen')){
            $('#add-link-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 600, function(){
                resetFields(settingsRactive);
                document.getElementById('add-button').classList.remove('disabled');
            });
            settingsRactive.set('addLinkOpen', !settingsRactive.get('addLinkOpen'));
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
        chrome.storage.local.set({'createdLinks':settingsRactive.get('createdLinks')});
    });

    settingsRactive.observe('tooManyLinks', function(newValue, oldValue){
        checkAndDisable(newValue);
        //chrome.storage.local.set({'createdLinks':settingsRactive.get('createdLinks')});
        //chrome.storage.local.set({'displayedLinks':templates.links.get('links')});
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
                chrome.storage.local.set({'settingSwitches':switches});
                var effectFunction = effectFunctions[switches[i].effect];
                effectFunction(switches[i].on);
                break;
            }
        }
        settingsRactive.set('switches', switches);
    });

    settingsRactive.on('deleteLink', function(event, index, obj){
        var links = settingsRactive.get('createdLinks');
        //console.log(links);
        var displayedLinks = templates.links.get('links');
        ////console.log('deleting: ');
        ////console.log(links[index]);
        ////console.log(displayedLinks[displayedLinks.indexOf(obj)]);
        ////console.log(links);
        ////console.log(displayedLinks);

        $('#'+index+'-sortable-item').toggle('drop', {'easing':'easeOutQuad'}, 500, function(){
            //console.log('before:');
            //console.log(links);
            links.splice(index,1);
            if(obj.enabled){
                displayedLinks.splice(displayedLinks.indexOf(obj),1);
            }
            reloadLinks();
            settingsRactive.set('tooManyLinks', templates.links.get('links').length >= MAX_NUM_LINKS);
            chrome.storage.local.set({'createdLinks':settingsRactive.get('createdLinks')});
            chrome.storage.local.set({'displayedLinks':templates.links.get('links')});
            //console.log('after:');
            //console.log(links);
        });
    });

    settingsRactive.set('addLinkOpen', false);
    $('#add-button').click(function(){
        if(!settingsRactive.get('addLinkOpen')){
            $('#add-link-prompt').toggle('blind', {'easing': 'easeOutCubic'}, 600);
            settingsRactive.set('addLinkOpen', !settingsRactive.get('addLinkOpen'));
            document.getElementById('add-button').classList.add('disabled');
        }
    });
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
        //////console.log(objs[i]);
        //////console.log('i: ' + i);
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
    chrome.storage.local.set({'linkOrder':indices});
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
    chrome.storage.local.set({'displayedLinks':templates.links.get('links')});
}

function setupLinkDefaults(){
    var links = templates.settings.get('createdLinks');
    links.forEach(function(link){
        if(link.defaultLink == true){
            document.getElementById('delete-'+links.indexOf(link)).style.visibility = 'hidden';
        }
    });
}

function attachErrorListeners(settingsRactive){
    document.getElementById('preview').addEventListener('error', function(){
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
    });

    document.getElementById('preview').addEventListener('load', function(){
        settingsRactive.set('imageError', false);
        document.getElementById('image-error').style.visibility = 'hidden';
        document.getElementById('preview').style.display = 'inherit';
        document.getElementById('preview-alternate').style.display = 'none';
        //$.adaptiveBackground.run();
    });

    document.getElementById('image-error').addEventListener('mouseover', function(){
        if(settingsRactive.get('imageError')){
            document.getElementById('error-tip').innerText = "Invalid URL. Don't worry, image is optional.";
        }
    });

    document.getElementById('image-error').addEventListener('mouseout', function(){
        if(settingsRactive.get('imageError')){
            document.getElementById('error-tip').innerText = "";
        }
    });

    document.getElementById('name-error').addEventListener('mouseover', function(){
        document.getElementById('error-tip').innerText = "Name must be 1 to 15 characters long.";
    });

    document.getElementById('name-error').addEventListener('mouseout', function(){
        document.getElementById('error-tip').innerText = "";
    });

    document.getElementById('url-error').addEventListener('mouseover', function(){
        document.getElementById('error-tip').innerText = "Please enter a URL.";
    });

    document.getElementById('url-error').addEventListener('mouseout', function(){
        document.getElementById('error-tip').innerText = "";
    });
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
        //////console.log(setting.effect);
        //////console.log(effectFunctions);
        effectFunction(setting.on);
        //////console.log('what');
    });

}

function setupLinkTooltips(){
    $('.min-link-label').tooltip({
        position: {
            my:"right-77 center",
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
        document.getElementById('name-error').style.visibility = 'visible';
        if(!settingsRactive.get('nameError')){
            settingsRactive.set('nameError', true);
            errors++;
        }
    }
    else {
        document.getElementById('name-error').style.visibility = 'hidden';
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
        document.getElementById('url-error').style.visibility = 'visible';
        if(!settingsRactive.get('urlError')){
            settingsRactive.set('urlError', true);
            errors++;
        }
    }
    else{
        document.getElementById('url-error').style.visibility = 'hidden';
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