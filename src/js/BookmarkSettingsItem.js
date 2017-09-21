const React = require('react');

export class BookmarkSettingsItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='bookmark-settings-item'>
        <div className='bookmark-settings-item-reorder'>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </div>
        <div className='bookmark-settings-item-preview-image'>
          <img src={this.props.bookmark.image}/>
        </div>
        <div className='bookmark-settings-item-label'>
          {this.props.bookmark.label}
        </div>
      </div>
    );
  }
}

module.exports = BookmarkSettingsItem;
