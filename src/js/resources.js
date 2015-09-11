/******************
 *      MISC
 ******************/
var images = ['images/backgrounds/cameron.jpg', 'images/backgrounds/chapel.jpg',
    'images/backgrounds/east.jpg', 'images/backgrounds/kville.jpg',
    'images/backgrounds/spring_chapel.jpg', 'images/backgrounds/winter_chapel.jpg',
    'images/backgrounds/side_chapel.jpg', 'images/backgrounds/inside_chapel.jpg',
    'images/backgrounds/duke_gardens.jpg', 'images/backgrounds/duke_gardens_terrace.jpg'
];
var imageSources = {
    'images/backgrounds/cameron.jpg':{
        'source': 'Blue Devil Nation',
        'link':'http://bluedevilnation.net/wordpress/wp-content/uploads/2012/02/duke-signs-056.jpg'
    },
    'images/backgrounds/chapel.jpg':{
        'source': 'Aljazeera',
        'link':'http://america.aljazeera.com/content/dam/ajam/images/articles_2015/01/Duke_University_Chapel__A_1152015.jpg'
    },
    'images/backgrounds/east.jpg':{
        'source':'Huffington Post',
        'link':'http://i.huffpost.com/gen/1091792/images/o-DUKE-UNIVERSITY-GENDER-CONFIRMATION-facebook.jpg'
    },
    'images/backgrounds/kville.jpg':{
        'source':'Tyler Haar, Wordpress',
        'link':'https://tylerhaar.files.wordpress.com/2012/07/photo-jul-16-1-13-48-pm.jpg'
    },
    'images/backgrounds/spring_chapel.jpg':{
        'source':'Yumian Deng, Creative Commons',
        'link':'http://blog.textbooks.com/wp-content/uploads/2014/10/duke-university-flickr-theomania-most-beautiful-college-campuses.jpg'
    },
    'images/backgrounds/inside_chapel.jpg':{
        'source':'Prevoir Photography, Wordpress',
        'link':'https://prevoirphotography.files.wordpress.com/2012/01/duke-chapel-93.jpg'
    },
    'images/backgrounds/winter_chapel.jpg':{
        'source':'Slate.com',
        'link':'http://www.slate.com/content/dam/slate/blogs/the_slatest/2015/01/15/duke_university_cancels_planned_chapel_weekly_muslim_call_to_prayer/dukechapel.jpeg/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg'
    },
    'images/backgrounds/side_chapel.jpg':{
        'source':'Wojdylo Social Media',
        'link':'http://wojdylosocialmedia.com/wp-content/uploads/2013/12/dukechapelsky1.jpg'
    },
    'images/backgrounds/duke_gardens.jpg':{
        'source':'Duke University Medical Center',
        'link':'https://archives.mc.duke.edu/sites/default/files/garden-bridge-ems.jpg'
    },
    'images/backgrounds/duke_gardens_terrace.jpg':{
        'source':'Wikimedia',
        'link':'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2008-07-15_Duke_Gardens_main_terrace.jpg/1280px-2008-07-15_Duke_Gardens_main_terrace.jpg'
    }
};
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
var venueStatuses = {};
var OPEN = 'images/status/green.png';
var CLOSED = 'images/status/red.png';
var icons = {
    'open': OPEN,
    'closed': CLOSED
};
var OFFSET_PERCENT = 0.15;
var DISABLE_FADE_ELEMENTS = '';
var SHOW_SECONDS = '';
var MILITARY_TIME = '';

/******************
 *     BUSING
 ******************/
var desiredStops = ["4117202", "4146366", "4158202", "4098210", "4177628", "4177630",
    "4098226", "4098230", "4158230", "4177632", "4157330", "4151494", "4098294", "4098298", "4098394", "4098218"];
var desiredStopNames = {
    4098394: 'Campus Walk/LaSalle South',
    4098218: "Research Dr at Duke Clinic",
    4098210: "Science Drive Circle",
    4098226: "Flowers Drive Southbound",
    4098230: "Flowers Drive Northbound",
    4117202: "East Campus Quad",
    4146366: "Duke Chapel",
    4151494: "Swift Ave at Campus Dr Eastbound",
    4157330: "Swift/Campus Westbound",
    4158202: "Gilbert-Addoms Westbound",
    4158230: "Smith Warehouse Westbound",
    4177628: "Campus/Anderson Westbound",
    4177630: "Campus/Anderson Eastbound",
    4177632: "Smith Warehouse Eastbound",
    4098298: "Alexander Ave at Pace St Westbound",
    4098294: "Alexander Ave at Pace St Eastbound"
};
var stopOrder = [
    "Duke Chapel",
    "East Campus Quad",
    "Alexander/Pace Westbound",
    "Alexander/Pace Eastbound",
    "Campus Walk/LaSalle South",
    "Research Dr at Duke Clinic",
    "Science Drive Circle",
    "Gilbert-Addoms Westbound",
    "Smith Warehouse Eastbound",
    "Smith Warehouse Westbound",
    "Campus/Anderson Eastbound",
    "Campus/Anderson Westbound",
    "Flowers Drive Southbound",
    "Flowers Drive Northbound",
    "Swift/Campus Eastbound",
    "Swift/Campus Westbound"
];

var altStopNames = {
    "Swift Ave at Campus Dr Eastbound": "Swift/Campus Eastbound",
    "Alexander Ave at Pace St Eastbound": "Alexander/Pace Eastbound",
    "Alexander Ave at Pace St Westbound": "Alexander/Pace Westbound"
};

var busColor = {
    "C1: East-West":"red",
    "C1: East-West Weekends":"red",
    "C3: East-Science":"#3388bb",
    "C4: Central-West":"#55aa66",
    "C5: East-Central":"yellow",
    "CCX: Central Campus Express Weekend":"orange",
    "CCX: Central Campus Express":"orange",
    "CSW: Smith Warehouse":"pink",
    "PR1: Bassett-Research":"#225555",
    "H2: Hospital Loop":"turquoise",
    "H5: Broad-Erwin":"gray",
    "H6: Remote Lot-Hospital":"purple",
    "LL: LaSalle Loop":"green",
};
var DUKE_AGENCY_ID = 176;
var BUS_REFRESH_RATE = 30000;

/******************
 *     WEATHER
 ******************/
var WEATHER_REFRESH_RATE = 900000;

/******************
 *     DINING
 ******************/
var DINING = {
    "venues":[
        {
            "name": "Au Bon Pain",
            "open": {
                "Monday":[[25200, 86399]],
                "Tuesday":[[25200, 86399]],
                "Wednesday":[[25200, 86399]],
                "Thursday":[[25200, 86399]],
                "Friday":[[25200, 86399]],
                "Saturday":[[25200, 86399]],
                "Sunday":[[25200, 86399]]
            },
            "currentlyOpen": false,
            "menu":'https://studentaffairs.duke.edu/sites/default/files/u1379/Online%20Menu%20-%20Fall%20FY13%20copy.pdf'
        },
        {
            "name": "Bella Union",
            "open":{
                "Monday":[[28800, 86399]],
                "Tuesday":[[28800, 86399]],
                "Wednesday":[[28800, 86399]],
                "Thursday":[[28800, 86399]],
                "Friday":[[28800, 86399]],
                "Saturday":[[36000, 86399]],
                "Sunday":[[39600, 86399]]
            },
            "currentlyOpen": false
        },
        {
            "name": "Blue Express",
            "open":{
                "Monday":[[28800, 54000]],
                "Tuesday":[[28800, 54000]],
                "Wednesday":[[28800, 54000]],
                "Thursday":[[28800, 54000]],
                "Friday":[[28800, 54000]]
            },
            "currentlyOpen": false,
            "menu":'http://www.lsrcblueexpress.com/#!menu/c1xfq'
        },
        {
            "name":"Cafe Edens",
            "alwaysOpen": true,
            "menu":'https://studentaffairs.duke.edu/sites/default/files/u1379/PitchforkMenuDraft.pdf'
        },
        {
            "name": "Divinity Cafe",
            "open":{
                "Monday":[[28800, 57600]],
                "Tuesday":[[28800, 57600]],
                "Wednesday":[[28800, 57600]],
                "Thursday":[[28800, 57600]],
                "Friday":[[28800, 54000]],
                "Sunday":[[37800, 52200]]
            },
            "currentlyOpen": false,
            "menu": 'https://studentaffairs.duke.edu/dining/venues-and-menus/divinity-refectory'
        },
        {
            "name": "Grace's Cafe",
            "open": {
                "Monday":[[36000, 75600]],
                "Tuesday":[[36000, 75600]],
                "Wednesday":[[36000, 75600]],
                "Thursday":[[36000, 75600]],
                "Friday":[[36000, 75600]],
                "Sunday":[[36000, 75600]]
            },
            "currentlyOpen": false,
            "menu": 'https://studentaffairs.duke.edu/sites/default/files/u1379/Graces-2015.pdf'
        },
        {
            "name": "Loop Pizza Grill",
            "open":{
                "Monday":[[37800, 86399]],
                "Tuesday":[[37800, 86399]],
                "Wednesday":[[37800, 86399]],
                "Thursday":[[37800, 86399]],
                "Friday":[[37800, 86399]],
                "Saturday":[[0,7200],[37800, 86399]],
                "Sunday":[[0,7200],[37800, 86399]]
            },
            "currentlyOpen": false,
            "menu": "http://www.looppizzagrill.com/media/5438/durham.pdf"
        },
        {
            "name": "Marketplace",
            "open":{
                "Monday":[[27000, 39600],[43200, 52200],[61200, 75600]],
                "Tuesday":[[27000, 39600],[43200, 52200],[61200, 75600]],
                "Wednesday":[[27000, 39600],[43200, 52200],[61200, 75600]],
                "Thursday":[[27000, 39600],[43200, 52200],[61200, 75600]],
                "Friday":[[27000, 39600],[43200, 52200],[61200, 75600]],
                "Saturday":[[36000, 50400],[61200, 75600]],
                "Sunday":[[36000, 50400],[61200, 75600]]
            },
            "currentlyOpen": false
        },
        {
            "name":"McDonalds",
            "alwaysOpen": true,
            "menu":"https://studentaffairs.duke.edu/sites/default/files/u1379/McDonalds%20Menu%202013.pdf"
        },
        {
            "name": "Panda Express",
            "open":{
                "Monday":[[39600, 79200]],
                "Tuesday":[[39600, 79200]],
                "Wednesday":[[39600, 79200]],
                "Thursday":[[39600, 79200]],
                "Friday":[[39600, 79200]],
                "Saturday":[[39600, 79200]],
                "Sunday":[[39600, 79200]]
            },
            "currentlyOpen": false,
            "menu":'http://www.pandaexpress.com/menu/#!/orange-chicken'
        },
        {
            "name": "Penn Pavilion",
            "open":{
                "Monday":[[27000, 72000]],
                "Tuesday":[[27000, 72000]],
                "Wednesday":[[27000, 72000]],
                "Thursday":[[27000, 72000]],
                "Friday":[[27000, 52200]],
                "Sunday":[[57600, 72000]]
            },
            "currentlyOpen": false,
            "menu": "http://duke.cafebonappetit.com/cafe/events-pavillion/#menu-cafe-select"
        },
        {
            "name": "Quenchers",
            "open": {
                "Monday":[[36000, 75600]],
                "Tuesday":[[36000, 75600]],
                "Wednesday":[[36000, 75600]],
                "Thursday":[[36000, 75600]],
                "Friday":[[36000, 75600]],
                "Saturday":[[36000, 75600]],
                "Sunday":[[36000, 75600]]
            },
            "currentlyOpen": false
        },
        {
            "name": "Red Mango",
            "open": {
                "Monday":[[39600, 82800]],
                "Tuesday":[[39600, 82800]],
                "Wednesday":[[39600, 82800]],
                "Thursday":[[39600, 82800]],
                "Friday":[[39600, 82800]],
                "Saturday":[[39600, 82800]],
                "Sunday":[[39600, 82800]]
            },
            "currentlyOpen": false
        },
        {
            "name": "Saladelia at Perkins",
            "open":{
                "Monday":[[27000, 86399]],
                "Tuesday":[[27000, 86399]],
                "Wednesday":[[27000, 86399]],
                "Thursday":[[27000, 86399]],
                "Friday":[[27000, 61200]],
                "Saturday":[[43200, 64800]],
                "Sunday":[[57600, 86399]]
            },
            "currentlyOpen": false
        },
        {
            "name": "Trinity Cafe",
            "open":{
                "Monday":[[28800, 86399]],
                "Tuesday":[[28800, 86399]],
                "Wednesday":[[28800, 86399]],
                "Thursday":[[28800, 86399]],
                "Friday":[[28800, 79200]],
                "Saturday":[[43200, 79200]],
                "Sunday":[[43200, 86399]]
            },
            "currentlyOpen": false
        },
        {
            "name": "Twinnie's",
            "open":{
                "Monday":[[28800, 64800]],
                "Tuesday":[[28800, 64800]],
                "Wednesday":[[28800, 64800]],
                "Thursday":[[28800, 64800]],
                "Friday":[[28800, 64800]]
            },
            "currentlyOpen": false,
            "menu":"https://studentaffairs.duke.edu/sites/default/files/u1379/Twinnie%27s%20lunch-bfast%20menu.jpg"
        }
    ]
};

var defaultLinks = [
    {
        url:"https://outlook.office365.com/owa/?realm=duke.edu",
        tooltipUrl:"https://outlook.office365.com/owa/?realm=duke.edu",
        icon:"images/links/outlook.png",
        label:'Outlook Mail',
        showIcon:'',
        showText:'display: none',
        labelOffset: '5px',
        enabled:true,
        disabled:false,
        defaultLink:true
    },
    {
        url:"http://www.youtube.com",
        tooltipUrl:"http://www.youtube.com",
        icon:"images/links/youtube.png",
        label:'Youtube',
        showIcon:'',
        showText:'display: none',
        labelOffset: '5px',
        enabled:true,
        disabled:false,
        defaultLink:true
    },
    {
        url:"https://sakai.duke.edu/",
        tooltipUrl:"https://sakai.duke.edu/",
        icon:"images/links/sakai.png",
        label:'Sakai',
        showIcon:'',
        showText:'display: none',
        labelOffset: '5px',
        enabled:true,
        disabled:false,
        defaultLink:true
    },
    {
        url:"https://www.netflix.com",
        tooltipUrl:"https://www.netflix.com",
        icon:'images/links/netflix.png',
        label:'Netflix',
        showIcon:'',
        showText:'display: none',
        labelOffset: '5px',
        enabled:true,
        disabled:false,
        defaultLink:true
    },
    {
        url:"https://www.facebook.com",
        tooltipUrl:"https://www.facebook.com",
        icon:'images/links/facebook.png',
        label:'Facebook',
        showIcon:'',
        showText:'display: none',
        labelOffset: '5px',
        enabled:true,
        disabled:false,
        defaultLink:true
    }
];
var MAX_NUM_LINKS = 7;

var SWITCHES = [
    {
        id:"font",
        label:"Bold clock font",
        on:false,
        effect:'toggleBoldClock'
    },
    {
        id:"fade",
        label:"Disable fade-in effect",
        on:false,
        effect:'toggleFadeIn'
    },
    {
        id:"seconds",
        label:"Display seconds",
        on:true,
        effect:'toggleSecondsDisplay'
    },
    {
        id:"military",
        label:"24-Hour Clock",
        on:false,
        effect:'toggleMilitaryTime'
    }
];

var effectFunctions = {
    'toggleBoldClock':toggleBoldClock,
    'toggleFadeIn':toggleFadeIn,
    'toggleSecondsDisplay':toggleSecondsDisplay,
    'toggleMilitaryTime':toggleMilitaryTime
};

var switchRef = {
    small:{
        'true':{
            color:'#05B8CC',
            offset:'-15px'
        },
        'false':{
            color:'white',
            offset:'0px'
        }
    },
    normal:{
        'true':{
            color:'#05B8CC',
            offset:'-20px'
        },
        'false':{
            color:'white',
            offset:'0px'
        }
    }
}

function toggleBoldClock(on){
    if(on){
        document.getElementById('clock').style.fontWeight = 600;
    }
    else{
        document.getElementById('clock').style.fontWeight = 400;
    }
}

function toggleMilitaryTime(on){
    MILITARY_TIME = on;
    templates.settings.set('militaryTime', on);
}

function toggleFadeIn(on){
    DISABLE_FADE_ELEMENTS = on;
}

function toggleSecondsDisplay(on){
    SHOW_SECONDS = on;
}