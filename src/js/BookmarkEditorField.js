const React = require('react');

export class BookmarkEditorField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      initialized: false,
    }
  }

  componentDidMount() {
    this.setState({
      focused: false,
      initialized: false,
    });
  }

  _focusField() {
    this.setState({
      focused: true,
      initialized: true,
    });
  }

  _leaveFocusField() {
    this.setState({
      focused: false,
    });
  }

  render() {
    let errorType;
    let errorTypeIcon;

    if (this.props.errorType == 0) {
      errorType = 'warning';
      errorTypeIcon = (
        <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
      );
    } else if (this.props.errorType == 1) {
      errorType = 'error';
      errorTypeIcon = (
        <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
      );
    }

    let errorHint = (
      <div className={
        !this.state.focused && this.props.hasError && this.state.initialized
        ? 'bookmark-editor-field-error ' + errorType
        : 'bookmark-editor-field-error'
      }>
        {errorTypeIcon}
        &nbsp;
        {this.props.errorText}
      </div>
    );

    return (
      <div className='bookmark-editor-field-container'>
        <div className='bookmark-editor-field-label'>
          {this.props.label}
        </div>
        <input
          className='bookmark-editor-field'
          placeholder={this.props.placeholder}
          onFocus={this._focusField.bind(this)}
          onBlur={this._leaveFocusField.bind(this)}
          onChange={this.props.updateValue}
          maxLength={this.props.maxLength}/>
        <div className={
          this.state.focused
          ? 'bookmark-editor-field-focus focused'
          : 'bookmark-editor-field-focus'
        }/>
        {errorHint}
      </div>
    );
  }
}

module.exports = BookmarkEditorField;
