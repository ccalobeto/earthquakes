export function mapLabels ({
  svg = null, // pass in a d3 selection
  message = 'Put a message here',
  fontSize = 15
} = {}) {
  // svg.selectAll('g').remove()
  const label = svg.append('g')
    .attr('class', 'labels')
    // push down to radius of largest circle
    .attr('transform', 'translate(0, 0)')

  // set the message
  label
    .append('text')
    .text(message)
    .attr('transform', 'translate(80, 0)')
    .attr('text-anchor', 'start')
    .style('font-size', fontSize)
    .attr('lenghtAdjust', 'spacingAndGlyphs')

  return label.node()
}
