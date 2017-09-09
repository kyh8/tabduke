const React = require('react');
const Keys = require('../data/keys.json');

export class BusList extends React.Component {
  constructor(props) {
    super(props);
    this._renderBusList();
  }

  _renderBusList() {
    console.log(Keys.transloc);
  }

  render() {
    return (
      <div className='list-container'>
        <div className='list-header'>
          {'Buses'}
        </div>
        <div className='bus-list'>
        </div>
      </div>
    );
  }
}

module.exports = BusList;
