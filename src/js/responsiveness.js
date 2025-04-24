import { select } from 'd3-selection'

export function responsivefy (svg) {
  // get container + svg aspect ratio
  const container = select(svg.node().parentNode)
  const width = parseInt(svg.style('width'))
  const height = parseInt(svg.style('height'))
  const aspect = width / height

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('perserveAspectRatio', 'xMinYMid')
    .call(resize)

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://goo.gl/7xe4TN
  select(window).on('resize.' + container.attr('id'), resize)

  // get width of container and resize svg to fit it
  function resize () {
    const targetWidth = parseInt(container.style('width'))
    svg.attr('width', targetWidth)
    svg.attr('height', Math.round(targetWidth / aspect))
  }
}
