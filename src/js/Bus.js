const React = require('react');

export class Bus extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='bus'>
        <div
          className='bus-route-color'
          style={{
            backgroundColor: this.props.color,
          }}/>
        <div className='bus-route-container'>
          <div className='bus-route'>
            {this.props.name}
          </div>
          <div className='bus-arrival-times'>
            {this.props.times}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Bus;
