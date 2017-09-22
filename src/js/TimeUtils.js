const React = require('react');

export class TimeUtils {
  static getTimeString(time, showSeconds, militaryTime) {
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
    let displayTime = hours;
    let nonMilitaryHours;
    if (!militaryTime) {
      if (parseInt(hours) > 12) {
        nonMilitaryHours = parseInt(hours) - 12;
      } else if (parseInt(hours) == 0) {
        nonMilitaryHours = 12;
      } else {
        nonMilitaryHours = parseInt(hours);
      }

      displayTime = nonMilitaryHours;
    }

    displayTime += ':' + minutes;

    if (showSeconds) {
      displayTime += ':' + seconds;
    }

    if (!militaryTime) {
      if (parseInt(hours) > 12) {
        displayTime += ' PM';
      } else {
        displayTime += ' AM';
      }
    }
    return displayTime;
  }
}

module.exports = TimeUtils;
