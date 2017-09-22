const React = require('react');
const SettingsSectionConstants = require('./SettingsSectionConstants');
const {
  Sortable,
  SortableHandle,
} = require('react-sortable-hoc');

const MAX_BOOKMARKS = 8;
const DELETE_ANIMATE_DURATION = 300;

export class BookmarkSettingsItem extends React.Component {
  constructor(props) {
    super(props);

    let bookmarks = this.props.dashboardSettings.bookmarks;
    let shownBookmarks = bookmarks.filter(b => b.isShown == 'true');
    this.state = {
      canShow: shownBookmarks.length < MAX_BOOKMARKS,
      animatingDelete: false,
    }
  }

  _toggleSwitch() {
    let bookmark = this.props.bookmark;
    let bookmarks = this.props.dashboardSettings.bookmarks;
    let shownBookmarks = bookmarks.filter(b => b.isShown == 'true');
    if (shownBookmarks.length >= MAX_BOOKMARKS && bookmark.isShown == 'false') {
      return;
    }

    let index = bookmarks.indexOf(bookmark);
    bookmark.isShown = String(this.props.bookmark.isShown != 'true');
    bookmarks[index] = bookmark;
    this.props.updateSettings(
      SettingsSectionConstants.BOOKMARKS,
      null,
      bookmarks,
    );
  }

  _deleteBookmark() {
    this.setState({
      animatingDelete: true,
    }, () => {
      setTimeout(() => {
        let bookmark = this.props.bookmark;
        let bookmarks = this.props.dashboardSettings.bookmarks;
        let index = bookmarks.indexOf(bookmark);
        bookmarks.splice(index, 1);
        this.props.updateSettings(
          SettingsSectionConstants.BOOKMARKS,
          null,
          bookmarks,
        );
      }, DELETE_ANIMATE_DURATION);
    });
  }

  render() {
    const DragHandle = SortableHandle(() => {
      return (
        <div className='bookmark-settings-item-reorder'>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </div>
      );
    });

    let previewIcon;
    if (this.props.bookmark.image.length > 0) {
      previewIcon = (
        <img src={this.props.bookmark.image}/>
      );
    } else {
      previewIcon = (
        <div>
          {this.props.bookmark.label.charAt(0)}
        </div>
      );
    }

    let bookmarks = this.props.dashboardSettings.bookmarks;
    bookmarks.filter(bookmark => bookmark.isShown == 'true').length

    let containerClass;
    if (this.props.bookmark.isShown == 'true') {
      containerClass = 'enabled';
    } else if (
      bookmarks.filter(
        bookmark => bookmark.isShown == 'true'
      ).length >= MAX_BOOKMARKS
    ) {
      containerClass = 'off';
    } else {
      containerClass = 'disabled'
    }

    return (
      <li className={
        this.state.animatingDelete
        ? 'bookmark-settings-item deleted'
        : 'bookmark-settings-item'
      }>
        <DragHandle />
        <div
          className={'settings-item-switch-container ' + containerClass}
          onClick={this._toggleSwitch.bind(this)}>
          <div className='settings-item-switch'/>
        </div>
        <div className='bookmark-settings-item-preview-image' style={{
          backgroundColor: this.props.bookmark.color,
        }}>
          {previewIcon}
        </div>
        <div className='bookmark-settings-item-label'>
          {this.props.bookmark.label}
        </div>
        <div
          className='bookmark-settings-item-delete'
          onClick={this._deleteBookmark.bind(this)}>
          <i className="fa fa-trash-o" aria-hidden="true"></i>
        </div>
      </li>
    );
  }
}

module.exports = BookmarkSettingsItem;
