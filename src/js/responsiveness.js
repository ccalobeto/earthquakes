import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.0/+esm'

export function responsivefy (svg) {
  // Container is the DOM element, svg is appended.
  // Then we measure the container and find its
  // aspect ratio.
  const container = select(svg.node().parentNode)
  const width = parseInt(svg.style('width'), 10)
  const height = parseInt(svg.style('height'), 10)
  const aspect = width / height

  // Add viewBox attribute to set the value to initial size
  // add preserveAspectRatio attribute to specify how to scale
  // and call resize so that svg resizes on page load
  svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMinYMid')
    .call(resize)

  select(window).on('resize.' + container.attr('id'), resize)

  function resize () {
    const targetWidth = parseInt(container.style('width'))
    svg.attr('width', targetWidth)
    svg.attr('height', Math.round(targetWidth / aspect))
  }
}
