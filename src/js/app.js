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
  'cameron.jpg',
  'chapel.jpg',
  'west-union.jpg',
  'duke_gardens_terrace.jpg',
  'duke_gardens.jpg',
  'east.jpg',
  'inside_chapel.jpg',
  'kville.jpg',
  'side_chapel.jpg',
  'spring_chapel.jpg',
  'winter_chapel.jpg',
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
    }
  }

  componentWillMount() {
    this._initializeSettings();
  }

  _setBackground() {
    const index = Math.floor(Math.random() * BACKGROUNDS.length);
    let path = 'src/assets/backgrounds/' + BACKGROUNDS[index];
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
      </div>
    );
  }
}

module.exports = App;
