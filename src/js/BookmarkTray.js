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

  render() {
    return (
      <div className='bookmarks-container'>
        <Bookmark
          image={'http://cdn.appstorm.net/windows.appstorm.net/files/2012/10/Reddit-logo.jpg'}
          href={'https://www.reddit.com'}
          label={'reddit'}
          index={0}
          hoveredIndex={this.state.hovered}
          setHovered={this.setHovered.bind(this)}/>
        <Bookmark
          image={'https://www.facebook.com/images/fb_icon_325x325.png'}
          href={'https://www.facebook.com'}
          label={'Facebook'}
          index={1}
          hoveredIndex={this.state.hovered}
          setHovered={this.setHovered.bind(this)}/>
        <Bookmark
          image={'https://www.eyerys.com/sites/default/files/workplace-by-facebook.png'}
          href={'https://fb.facebook.com'}
          label={'Workplace'}
          index={2}
          hoveredIndex={this.state.hovered}
          setHovered={this.setHovered.bind(this)}/>
      </div>
    );
  }
}

module.exports = BookmarkTray;
