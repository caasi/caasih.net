render() {
  const { w, h } = this.state
  const width = w + 2 * this.padding.vertical
  const height = h + 2 * this.padding.horizontal

  return (
    <Group>
      <Rect
        width={width}
        height={height}
        fill="red"
        cornerRadius={6}
      />
      <Text
        x={this.padding.vertical}
        y={this.padding.horizontal}
        fontSize={32}
        text="much better"
        onResize={(w, h) => this.setState({ w, h })}
      />
    </Group>
  )
}
