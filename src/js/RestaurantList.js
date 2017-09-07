const React = require('react');
const Dining = require('../data/dining.json');
const Restaurant = require('./Restaurant');

export class RestaurantList extends React.Component {
  constructor(props) {
    super(props);

    console.log(Dining);

    this.state = {
    }
  }

  render() {
    return (
      <div className='restaurants-container'>

      </div>
    );
  }
}

module.exports = RestaurantList;
