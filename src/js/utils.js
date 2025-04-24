import { timeFormat } from 'd3-time-format'

export function getRegion (regions, department) {
  return regions[department]
}

export const multiFormat = (date) => {
  const formatMillisecond = timeFormat('.%L')
  const formatSecond = timeFormat(':%S')
  const formatMinute = timeFormat('%I:%M')
  const formatHour = timeFormat('%I %p')
  const formatDay = timeFormat('%a %d')
  const formatWeek = timeFormat('%b %d')
  const formatMonth = timeFormat('%B')
  const formatYear = timeFormat('%Y')

  return (date.getMilliseconds()
    ? formatMillisecond
    : date.getSeconds()
      ? formatSecond
      : date.getMinutes()
        ? formatMinute
        : date.getHours()
          ? formatHour
          : date.getDay()
            ? formatDay
            : date.getDate() !== 1
              ? formatWeek
              : date.getMonth()
                ? formatMonth
                : formatYear)(date)
}
