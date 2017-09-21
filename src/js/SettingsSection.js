const React = require('react');
const SettingsSectionConstants = require('./SettingsSectionConstants');
const BookmarkSettingsItem = require('./BookmarkSettingsItem');
const DashboardSettingsItem = require('./DashboardSettingsItem');

export class SettingsSection extends React.Component {
  constructor(props) {
    super(props);
  }

  _renderSettingItems() {
    if (this.props.title === SettingsSectionConstants.BOOKMARKS) {
      return this._renderBookmarkSettings();
    } else if (this.props.title === SettingsSectionConstants.OPTIONS) {
      return this._renderOptionSettings();
    }
  }

  _renderBookmarkSettings() {
    return (
      <div>
        <div className='bookmark-settings-items-container'>
          <div className='bookmark-settings-items'>
            {this._renderBookmarkSettingsItems()}
          </div>
        </div>
        <div className='bookmark-settings-item-create-container'>
          <div className='bookmark-settings-item-create'>
            <i className="fa fa-plus" aria-hidden="true"/>
            <div>Bookmark</div>
          </div>
        </div>
      </div>
    );
  }

  _renderBookmarkSettingsItems() {
    let bookmarkSettings = [];
    this.props.dashboardSettings.bookmarks.forEach((bookmark) => {
      const bookmarkSetting = (
        <BookmarkSettingsItem
          key={'bookmark-setting-' + bookmark.label}
          bookmark={bookmark}/>
      );
      bookmarkSettings.push(bookmarkSetting);
    });
    return bookmarkSettings;
  }

  _renderOptionSettings() {
    return (
      <div>
        <div className='dashboard-settings-items-container'>
          <div className='dashboard-settings-items'>
            {this._renderOptionSettingsItems()}
          </div>
        </div>
      </div>
    );
  }

  _renderOptionSettingsItems() {
    let optionSettings = [];
    this.props.dashboardSettings.options.forEach((option) => {
      const optionSetting = (
        <DashboardSettingsItem
          key={'dashboard-setting-' + option.name}
          option={option}/>
      );
      optionSettings.push(optionSetting);
    });
    return optionSettings;
  }

  render() {
    return (
      <div className='settings-section'>
        <div className='settings-section-label'>
          <div className='settings-section-icon'>
            <i className={'fa fa-' + this.props.icon} style={{
              color: this.props.iconColor,
            }}/>
          </div>
          <div className='settings-section-title'>
            {this.props.title}
          </div>
        </div>
        <div className='settings-section-items'>
          {this._renderSettingItems()}
        </div>
      </div>
    );
  }
}

module.exports = SettingsSection;
