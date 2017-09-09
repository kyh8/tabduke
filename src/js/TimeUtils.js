const React = require('react');

export class TimeUtils {
  static getTimeString(time, showSeconds) {
    const hours =
      time.getHours() < 10
      ? '0' + time.getHours()
      : time.getHours();
    const minutes =
      time.getMinutes() < 10
      ? '0' + time.getMinutes()
      : time.getMinutes();
    const seconds =
      time.getSeconds() < 10
      ? '0' + time.getSeconds()
      : time.getSeconds();
    let displayTime = hours + ':' + minutes;
    if (showSeconds) {
      displayTime += ':' + seconds;
    }
    return displayTime;
  }
}

module.exports = TimeUtils;
