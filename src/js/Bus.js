const React = require('react');

export class Bus extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='bus' style={{
        borderColor: this.props.color
      }}>
        <div className='bus-route'>
          {this.props.name}
        </div>
        <div className='bus-arrival-times'>
          {this.props.times}
        </div>
      </div>
    );
  }
}

module.exports = Bus;
