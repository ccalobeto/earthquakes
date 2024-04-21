import d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'
export function multiFormat () {
  const formatMillisecond = d3.timeFormat('.%L')
  const formatSecond = d3.timeFormat(':%S')
  const formatMinute = d3.timeFormat('%I:%M')
  const formatHour = d3.timeFormat('%I %p')
  const formatDay = d3.timeFormat('%a %d')
  const formatWeek = d3.timeFormat('%b %d')
  const formatMonth = d3.timeFormat('%b')
  const formatYear = d3.timeFormat('%Y')

  function multiFormat (date) {
    return (d3.timeSecond(date) < date
      ? formatMillisecond
      : d3.timeMinute(date) < date
        ? formatSecond
        : d3.timeHour(date) < date
          ? formatMinute
          : d3.timeDay(date) < date
            ? formatHour
            : d3.timeMonth(date) < date
              ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
              : d3.timeYear(date) < date
                ? formatMonth
                : formatYear)(date)
  }
  return multiFormat
}
