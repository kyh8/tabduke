const React = require('react');
const BookmarkEditorField = require('./BookmarkEditorField');
const SettingsSectionConstants = require('./SettingsSectionConstants');

const COLORS = [
  '#2686a3',
  '#4dc7ba',
  '#39a8c6',
  '#46d67d',
  '#00b682',
  '#55dafd',
  '#24807f',
];

export class BookmarkEditor extends React.Component {
  constructor(props) {
    super(props);

    const index = Math.floor(Math.random() * 7);
    const color = COLORS[index];

    this.state = {
      image: '',
      validImage: false,
      color: color,
      label: '',
      link: '',
      lastUpdate: null,
      waitingForUpdate: false,
      validBookmark: false,
    }
  }

  _updateValue(type, event) {
    let newState = {};
    newState[type] = event.target.value;
    if (type == 'image') {
      this.setState({
        lastUpdate: Date.now(),
        waitingForUpdate: true,
      })
      setTimeout(() => { // debounce
        let now = Date.now();
        if (now - this.state.lastUpdate > 400) {
          newState.waitingForUpdate = false;
          this.setState(newState, () => {
            let image = new Image();
            image.src = this.state.image;
            image.onerror = () => {
              this.setState({
                validImage: false,
              });
            }

            this.setState({
              validImage: true,
              validBookmark: this.state.label.length > 0
                && this.state.link.length > 0
            });
          });
        }
      }, 500);
    } else {
      this.setState(newState, () => {
        this.setState({
          validBookmark: this.state.label.length > 0
            && this.state.link.length > 0
        });
      });
    }
  }

  _createBookmark() {
    if (!this.state.validBookmark) {
      return;
    }
    let image = this.state.validImage ? this.state.image : '';
    let href = '';
    if (!this.state.link.startsWith('https://') && !this.state.link.startsWith('http://')) {
      href += 'https://';
    }
    href += this.state.link;
    let bookmark = {
      'image': image,
      'href': href,
      'label': this.state.label,
      'isShown': 'false',
      'color': this.state.validImage ? 'white' : this.state.color,
    };
    let bookmarks = this.props.dashboardSettings.bookmarks;
    bookmarks.push(bookmark);

    this.props.updateSettings(
      SettingsSectionConstants.BOOKMARKS,
      null,
      bookmarks,
    );

    this.props.hideEditor();
  }

  _cancelCreate() {
    const index = Math.floor(Math.random() * 7);
    const color = COLORS[index];
    this.setState({
      image: '',
      validImage: false,
      color: color,
      label: '',
      lastUpdate: null,
      validBookmark: false,
    }, () => {
      this.props.hideEditor();
    });
  }

  render() {
    let previewIcon;
    if (this.state.validImage) {
      previewIcon = (
        <img
          className='bookmark-image'
          src={this.state.image}
        />
      );
    } else {
      previewIcon = (
        <div
          className='new-bookmark-preview-icon'
          style={{
            backgroundColor: this.state.color,
          }}>
          {this.state.label.charAt(0)}
        </div>
      )
    }

    return (
      <div className='bookmark-editor-container'>
        <div className='bookmark-editor'>
          <BookmarkEditorField
            label={'Label'}
            placeholder={'Bookmark Label'}
            hasError={this.state.label.length == 0}
            maxLength={'14'}
            errorType={1}
            errorText={'You need to specify a label for your bookmark.'}
            updateValue={this._updateValue.bind(this, 'label')}/>
          <BookmarkEditorField
            label={'Image'}
            placeholder={'Icon URL'}
            hasError={!this.state.validImage}
            errorType={0}
            errorText={'Invalid image URL (icon image is optional).'}
            updateValue={this._updateValue.bind(this, 'image')}/>
          <BookmarkEditorField
            label={'Link'}
            placeholder={'Bookmark URL'}
            hasError={this.state.link.length == 0}
            errorType={1}
            errorText={'You need to specify a link for your bookmark.'}
            updateValue={this._updateValue.bind(this, 'link')}/>
        </div>
        <div className='new-bookmark-preview'>
          <div className='bookmark'>
            {previewIcon}
            <div className={'bookmark-label'}>
              {
                this.state.label.length == 0
                ? <i>Untitled</i>
                : this.state.label
              }
            </div>
          </div>
        </div>
        <div className='bookmark-editor-buttons'>
          <div
            className={
              this.state.validBookmark
              ? 'editor-button bookmark-editor-create'
              : 'editor-button bookmark-editor-create disabled'
            }
            onClick={this._createBookmark.bind(this)}>
            Create
          </div>
          <div
            className='editor-button bookmark-editor-cancel'
            onClick={this._cancelCreate.bind(this)}>
            Cancel
          </div>
        </div>
      </div>
    );
  }
}

module.exports = BookmarkEditor;
