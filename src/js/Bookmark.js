const React = require('react');

export class Bookmark extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered: false,
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
    let icon;
    if (this.props.image.length > 0) {
      icon = (
        <img
          className={
            this.state.hovered
            ? 'bookmark-image hovered'
            : 'bookmark-image'
          }
          style={{
            backgroundColor: this.props.color,
          }}
          onMouseOver={this._mouseEnter.bind(this)}
          onMouseLeave={this._mouseLeave.bind(this)}
          src={this.props.image}
        />
      );
    } else {
      icon = (
        <div
          className={
            this.state.hovered
            ? 'bookmark-image bookmark-icon hovered'
            : 'bookmark-image bookmark-icon'
          }
          style={{
            backgroundColor: this.props.color,
          }}
          onMouseOver={this._mouseEnter.bind(this)}
          onMouseLeave={this._mouseLeave.bind(this)}>
          {this.props.label.charAt(0)}
        </div>
      )
    }
    return (
      <div className='bookmark'>
        <a href={this.props.href}>
          {icon}
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
