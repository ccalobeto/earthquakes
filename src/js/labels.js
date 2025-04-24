export function mapLabels ({
  svg = null,
  message = 'Put a message here',
  fontSize = 15
} = {}) {
  const label = svg.append('g')
    .attr('class', 'labels')
    .attr('transform', 'translate(0, 0)')

  label
    .append('text')
    .text(message)
    .attr('transform', 'translate(80, 0)')
    .attr('text-anchor', 'start')
    .style('font-size', fontSize)
    .attr('lenghtAdjust', 'spacingAndGlyphs')

  return label.node()
}
