const React = require('react');
const TimeDisplay = require('./TimeDisplay');
const BookmarkTray = require('./BookmarkTray');
const RestaurantList = require('./RestaurantList');
const BusList = require('./BusList');
const SettingsPanel = require('./SettingsPanel');
const LoadingScreen = require('./LoadingScreen');
const SettingsSectionConstants = require('./SettingsSectionConstants');
const NoticeBoard = require('./NoticeBoard');

const DefaultBookmarks = require('../data/default-bookmarks.json');
const DefaultOptions = require('../data/default-options.json');

const BACKGROUNDS = [
  {
    image: 'cameron.jpg',
    source: 'Blue Devil Nation',
    link: 'http://bluedevilnation.net/wordpress/wp-content/uploads/2012/02/duke-signs-056.jpg',
  },
  {
    image: 'chapel.jpg',
    source: 'Aljazeera',
    link: 'http://america.aljazeera.com/content/dam/ajam/images/articles_2015/01/Duke_University_Chapel__A_1152015.jpg',
  },
  {
    image: 'west-union.jpg',
    source: 'Arch2O',
    link: 'http://www.arch2o.com/wp-content/uploads/2016/12/ARCH2O-Duke-University-West-Campus-Grimshaw-Architects-03.jpg',
  },
  {
    image: 'duke_gardens_terrace.jpg',
    source: 'Wikimedia',
    link: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/2008-07-15_Duke_Gardens_main_terrace.jpg/1280px-2008-07-15_Duke_Gardens_main_terrace.jpg',
  },
  {
    image: 'duke_gardens.jpg',
    source: 'Duke University Medical Center',
    link: 'https://archives.mc.duke.edu/sites/default/files/garden-bridge-ems.jpg',
  },
  {
    image: 'east.jpg',
    source: 'Huffington Post',
    link: 'http://i.huffpost.com/gen/1091792/images/o-DUKE-UNIVERSITY-GENDER-CONFIRMATION-facebook.jpg',
  },
  {
    image: 'inside_chapel.jpg',
    source: 'Prevoir Photography, Wordpress',
    link: 'https://prevoirphotography.files.wordpress.com/2012/01/duke-chapel-93.jpg',
  },
  {
    image: 'kville.jpg',
    source: 'Tyler Haar, Wordpress',
    link: 'https://tylerhaar.files.wordpress.com/2012/07/photo-jul-16-1-13-48-pm.jpg',
  },
  {
    image: 'side_chapel.jpg',
    source: 'Wojdylo Social Media',
    link: 'http://wojdylosocialmedia.com/wp-content/uploads/2013/12/dukechapelsky1.jpg',
  },
  {
    image: 'spring_chapel.jpg',
    source: 'Yumian Deng, Creative Commons',
    link: 'http://blog.textbooks.com/wp-content/uploads/2014/10/duke-university-flickr-theomania-most-beautiful-college-campuses.jpg',
  },
  {
    image: 'winter_chapel.jpg',
    source: 'Slate.com',
    link: 'http://www.slate.com/content/dam/slate/blogs/the_slatest/2015/01/15/duke_university_cancels_planned_chapel_weekly_muslim_call_to_prayer/dukechapel.jpeg/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg'
  },
];

const FADE_DURATION = 400;

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingImage: true,
      loadingData: true,
      settings: {
        bookmarks:[],
        options:{},
      },
      backgroundIndex: -1,
    }
  }

  componentWillMount() {
    this._initializeSettings();
  }

  _setBackground() {
    const index = Math.floor(Math.random() * BACKGROUNDS.length);
    let path = 'src/assets/backgrounds/' + BACKGROUNDS[index].image;
    this.setState({
      backgroundIndex: index,
    });

    var img = new Image();
    img.onload = () => {
      document.body.style.backgroundImage = 'url(' + path + ')';
      document.getElementById('loading-screen').classList.add('fade');
      setTimeout(() => {
        this.setState({
          loadingImage: false,
        });
      }, FADE_DURATION);
    };
    img.src = path;
  }

  _initializeSettings() {
    chrome.storage.sync.get('tabduke-settings', (data) => {
      let isEmpty = true;
      Object.keys(data).forEach((key) => {
        if (data.hasOwnProperty(key)) {
          isEmpty = false;
        }
      });

      if (isEmpty) {
        this.setState({
          loadingData: false,
          settings: {
            bookmarks: DefaultBookmarks.items,
            options: DefaultOptions.items,
          },
        }, () => {
          this._setBackground();
          chrome.storage.sync.set({'tabduke-settings': this.state.settings});
        });
      } else {
        this.setState({
          loadingData: false,
          settings: data['tabduke-settings'],
        }, () => {
          this._setBackground();
        });
      }
    });
  }

  updateSettings(settingType, key, newValue) {
    let newOptions = this.state.settings.options;
    let newBookmarks = this.state.settings.bookmarks;
    if (settingType === SettingsSectionConstants.OPTIONS) {
      newOptions[key].value = String(newValue);
    } else if (settingType === SettingsSectionConstants.BOOKMARKS) {
      newBookmarks = newValue;
    }

    this.setState({
      settings: {
        bookmarks: newBookmarks,
        options: newOptions,
      }
    }, () => {
      chrome.storage.sync.set({'tabduke-settings': this.state.settings});
    });
  }

  render() {
    let background = BACKGROUNDS[this.state.backgroundIndex];
    return (
      <div className='app'>
        {
          this.state.loadingImage
          ? <LoadingScreen/>
          : null
        }
        {
          this.state.loadingData
          ? null
          : (
            <div className='app-content'>
              <SettingsPanel
                dashboardSettings={this.state.settings}
                updateSettings={this.updateSettings.bind(this)}/>
              <TimeDisplay
                dashboardSettings={this.state.settings}
                updateSettings={this.updateSettings.bind(this)}/>
              <BookmarkTray
                dashboardSettings={this.state.settings}
                updateSettings={this.updateSettings.bind(this)}/>
              <div className='info-container'>
                <RestaurantList dashboardSettings={this.state.settings}/>
                <BusList/>
              </div>
            </div>
          )
        }
        {
          background
          ? (
            <div className='background-source'>
              {'Photo by '}
              <a href={background.link}>
                <strong>{background.source}</strong>
              </a>
            </div>
          ) : null
        }
        <div className='credits'>
          {'Thought of by '}
          <strong>Louis Li</strong>
          {' | Developed by '}
          <strong>Kevin He</strong>
        </div>
      </div>
    );
  }
}

module.exports = App;
