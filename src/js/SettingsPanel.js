const React = require('react');
const SettingsSection = require('./SettingsSection');
const SettingsSectionConstants = require('./SettingsSectionConstants');
const BookmarkEditor = require('./BookmarkEditor');

const ANIMATE_DURATION = 300;

export class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      panelShown: false,
      animating: false,
      editorShown: false,
    }
  }

  _togglePanel() {
    this.setState({
      panelShown: !this.state.panelShown,
      animating: true,
    }, () => {
      setTimeout(() => {
        this.setState({
          animating: false,
        });
      }, ANIMATE_DURATION);
    });
  }

  _toggleBookmarksEditor() {
    this.setState({
      editorShown: !this.state.editorShown,
    });
  }

  _renderBookmarkEditor() {
    return (
      <BookmarkEditor
        hideEditor={this._toggleBookmarksEditor.bind(this)}
        {...this.props}/>
    )
  }

  _renderSettingsSections() {
    const sections = Object.keys(SettingsSectionConstants.sections);
    let sectionElements = [];
    sections.forEach((section) => {
      const sectionInfo = SettingsSectionConstants.sections[section];
      const sectionElement = (
        <SettingsSection
          key={'settings-section-' + sectionInfo.title}
          icon={sectionInfo.icon}
          iconColor={sectionInfo.iconColor}
          title={sectionInfo.title}
          toggleEditor={this._toggleBookmarksEditor.bind(this)}
          {...this.props}/>
      );
      sectionElements.push(sectionElement);
    });
    return sectionElements;
  }

  render() {
    let openPanelLink = null;
    if (!this.state.panelShown && !this.state.animating) {
      openPanelLink = (
        <div
          className='settings-panel-open'
          onClick={this._togglePanel.bind(this)}>
          <i className="fa fa-cog" aria-hidden="true"></i>
        </div>
      );
    }

    let closePanelLink = null;
    if (this.state.panelShown && !this.state.animating) {
      closePanelLink = (
        <div
          className='settings-panel-close'
          onClick={this._togglePanel.bind(this)}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </div>
      );
    }

    return (
      <div className='settings'>
        {openPanelLink}
        <div id='settings-panel' className={
          this.state.panelShown
          ? 'settings-panel panel-show panel-animate'
          : 'settings-panel panel-hide panel-animate'
        }>
          {closePanelLink}
          <div className='settings-panel-container'>
            <div className='settings-panel-header'>
              {
                this.state.editorShown
                ? 'Create Bookmark'
                : 'Settings'
              }
            </div>
            <div className='settings-panel-content'>
              {
                this.state.editorShown
                ? this._renderBookmarkEditor()
                : this._renderSettingsSections()
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = SettingsPanel;
