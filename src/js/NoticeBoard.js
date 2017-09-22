const React = require('react');

export class NoticeBoard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='notice-board'>
        <div className='announcement'>
          <div className='announcement-icon'>
            <i className="fa fa-bell" aria-hidden="true" style={{
              color: '#fddd46',
              textShadow: '0 0 2px black'
            }}/>
          </div>
          <div>
            <div className='announcement-title'>
              Music Concert This Friday!
            </div>
            <div className='announcement-description'>
              {'This is a description of your event and what it would look like here. Here\'s some more filler words.'}
            </div>
          </div>
          <div className='announcement-close'>
            <i className="fa fa-times" aria-hidden="true"/>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = NoticeBoard;
