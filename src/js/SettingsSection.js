const React = require('react');
const SettingsSectionConstants = require('./SettingsSectionConstants');
const BookmarkSettingsItem = require('./BookmarkSettingsItem');
const DashboardSettingsItem = require('./DashboardSettingsItem');
const {
  Sortable,
  SortableContainer,
  SortableElement,
  arrayMove,
} = require('react-sortable-hoc');

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

  _onSortEnd({oldIndex, newIndex}) {
    if (oldIndex == newIndex) {
      return;
    }

    let newOrder = arrayMove(
      this.props.dashboardSettings.bookmarks,
      oldIndex,
      newIndex
    );

    this.props.updateSettings(
      SettingsSectionConstants.BOOKMARKS,
      null,
      newOrder,
    );
  }

  _renderBookmarkSettings() {
    const SortableItem = SortableElement(({bookmark}) => {
      return (
        <BookmarkSettingsItem
          key={'bookmark-setting-' + bookmark.label}
          bookmark={bookmark}
          {...this.props}/>
      );
    });

    const SortableList = SortableContainer(({items}) => {
      return (
        <ul className='bookmark-settings-items'>
          {items.map((bookmark, index) => (
            <SortableItem
              key={`bookmark-settings-item-${index}`}
              index={index}
              bookmark={bookmark}/>
          ))}
        </ul>
      );
    });

    const emptyList = (
      <div className='bookmark-settings-items-empty'>
        You have no bookmarks. Add some!
      </div>
    );

    return (
      <div>
        <div className='bookmark-settings-items-container'>
          {
            this.props.dashboardSettings.bookmarks.length > 0
            ? (
              <SortableList
                items={this.props.dashboardSettings.bookmarks}
                onSortEnd={this._onSortEnd.bind(this)}
                useDragHandle={true}
                helperClass={'bookmark-settings-item-placeholder'}/>
            )
            : emptyList
          }
        </div>
        <div className='bookmark-settings-item-create-container'>
          <div
            className='bookmark-settings-item-create'
            onClick={this.props.toggleEditor}>
            <i className="fa fa-plus" aria-hidden="true"/>
            <div>Bookmark</div>
          </div>
        </div>
      </div>
    );
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
    const options = this.props.dashboardSettings.options;
    Object.keys(options).forEach((option) => {
      const optionSetting = (
        <DashboardSettingsItem
          key={'dashboard-setting-' + option}
          option={options[option]}
          settingIndex={option}
          {...this.props}/>
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
