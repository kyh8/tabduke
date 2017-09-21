const React = require('react');
const TimeDisplay = require('./TimeDisplay');
const BookmarkTray = require('./BookmarkTray');
const RestaurantList = require('./RestaurantList');
const BusList = require('./BusList');
const SettingsPanel = require('./SettingsPanel');
const LoadingScreen = require('./LoadingScreen');

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

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      settings: {
        bookmarks:[],
        options:[],
      },
    }
  }

  componentDidMount() {
    this._setBackground();
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
          loading: false,
        });
      }, 1000);
    };
    img.src = path;
  }

  _initializeSettings() {
    console.log(DefaultBookmarks.items);
    this.setState({
      settings: {
        bookmarks: DefaultBookmarks.items,
        options: DefaultOptions.items,
      },
    });
  }

  updateSettings(settingType, key, newValue) {
    console.log('update', settingType + '-' + key, 'to', newValue);
  }

  render() {
    return (
      <div className='app-container'>
        {
          this.state.loading
          ? <LoadingScreen/>
          : null
        }
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
          <RestaurantList/>
          <BusList/>
        </div>
      </div>
    );
  }
}

module.exports = App;
