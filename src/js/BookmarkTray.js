const React = require('react');
const Bookmark = require('./Bookmark');

export class BookmarkTray extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hovered: -1,
    }
  }

  setHovered(index) {
    this.setState({
      hovered: index,
    });
  }

  _renderBookmarks() {
    let bookmarkElements = [];
    this.props.dashboardSettings.bookmarks.forEach((bookmark, index) => {
      let bookmarkElement;
      if (bookmark.isShown == 'true') {
        bookmarkElement = (
          <Bookmark
            key={'bookmark-' + bookmark.label}
            image={bookmark.image}
            href={bookmark.href}
            label={bookmark.label}
            color={bookmark.color}
            index={index}
            hoveredIndex={this.state.hovered}
            setHovered={this.setHovered.bind(this)}/>
        );
      }
      bookmarkElements.push(bookmarkElement);
    });
    return bookmarkElements;
  }

  render() {
    return (
      <div className='bookmarks-container'>
        {this._renderBookmarks()}
      </div>
    );
  }
}

module.exports = BookmarkTray;
