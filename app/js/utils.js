import { timeFormat } from 'd3-time-format'
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from 'd3-time'

export function multiFormat (date) {
  const formatMillisecond = timeFormat('.%L')
  const formatSecond = timeFormat(':%S')
  const formatMinute = timeFormat('%I:%M')
  const formatHour = timeFormat('%I %p')
  const formatDay = timeFormat('%a %d')
  const formatWeek = timeFormat('%b %d')
  const formatMonth = timeFormat('%b')
  const formatYear = timeFormat('%Y')

  return (timeSecond(date) < date
    ? formatMillisecond
    : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
          ? formatHour
          : timeMonth(date) < date
            ? (timeWeek(date) < date ? formatDay : formatWeek)
            : timeYear(date) < date
              ? formatMonth
              : formatYear)(date)
}

// get category
export function getRegion (categories, itemToFind) {
  let foundCategory
  for (const category in categories) {
    if (categories[category].includes(itemToFind)) {
      foundCategory = category
      break
    }
  }
  return foundCategory
}
