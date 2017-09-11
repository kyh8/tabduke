const React = require('react');
const TimeDisplay = require('./TimeDisplay');
const BookmarkTray = require('./BookmarkTray');
const RestaurantList = require('./RestaurantList');
const BusList = require('./BusList');
const SettingsPanel = require('./SettingsPanel');

const BACKGROUNDS = [
  'cameron.png',
  'chapel.png',
  'duke_gardens_terrace.png',
  'duke_gardens.png',
  'east.png',
  'inside_chapel.png',
  'kville.png',
  'side_chapel.png',
  'spring_chapel.png',
  'winter_chapel.png',
];

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }

  componentWillMount() {
    this._setBackground();
  }

  _setBackground() {
    const index = Math.floor(Math.random() * BACKGROUNDS.length);
    let path = 'src/assets/backgrounds/' + BACKGROUNDS[index];
    document.body.style.backgroundImage = 'url(' + path + ')';
  }

  render() {
    return (
      <div className='app-container'>
        <SettingsPanel/>
        <TimeDisplay/>
        <BookmarkTray/>
        <div className='info-container'>
          <RestaurantList/>
          <BusList/>
        </div>
      </div>
    );
  }
}

module.exports = App;
