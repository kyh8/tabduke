const React = require('react');
const TimeDisplay = require('./TimeDisplay');
const BookmarkTray = require('./BookmarkTray');
const RestaurantList = require('./RestaurantList');
const BusList = require('./BusList');

const BACKGROUNDS = [
  'cameron.jpg',
  'chapel.jpg',
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
    this._setBackground();

    this.state = {
    }
  }

  _setBackground() {
    const index = Math.floor(Math.random() * BACKGROUNDS.length);
    let path = 'src/assets/backgrounds/' + BACKGROUNDS[index];
    document.body.style.backgroundImage = 'url(' + path + ')';
  }

  render() {
    return (
      <div className='app-container'>
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
