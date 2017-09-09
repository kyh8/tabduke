const React = require('react');

export class Bookmark extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered: false,
      index: -1,
    }
  }

  _mouseEnter() {
    this.props.setHovered(this.props.index);
    this.setState({
      hovered: true,
    });
  }

  _mouseLeave() {
    this.props.setHovered(-1);
    this.setState({
      hovered: false,
    });
  }

  render() {
    return (
      <div
        className='bookmark'
        onMouseEnter={this._mouseEnter.bind(this)}
        onMouseLeave={this._mouseLeave.bind(this)}>
        <a href={this.props.href}>
          <img
            className='bookmark-image'
            src={this.props.image}
          />
        </a>
        <div className={
          this.state.hovered
          ? 'bookmark-label shown'
          : 'bookmark-label'
        }>
          {this.props.label}
        </div>
      </div>
    );
  }
}

module.exports = Bookmark;
