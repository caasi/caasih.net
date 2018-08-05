handleResize() {
  if (!this.textNode) return

  const width = this.textNode.getTextWidth()
  const height = this.textNode.getTextHegiht()

  if (this.width !== width || this.height !== height) {
    const { onResize } = this.props
    if (typeof onResize === 'function') {
      onResize(width, height)
    }
    this.width = width
    this.height = height
  }
}
