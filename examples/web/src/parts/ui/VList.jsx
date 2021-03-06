import React from 'react'
import z from '@z1/lib-feature-box'
import { VStack } from '@z1/lib-ui-box-elements'
import { AutoSizer } from 'react-virtualized/dist/es/AutoSizer'
import { List } from 'react-virtualized/dist/es/List'
import { isRenderProp } from './common'

// main
const renderVList = z.fn(t => props => {
  const box = t.atOr({}, 'box', props)
  const items = t.atOr([], 'items', props)
  const render = t.atOr(null, 'render', props)
  const baseListProps = isRenderProp(render)
    ? {
        rowCount: t.len(items),
        rowRenderer: rowProps => {
          const item = items[rowProps.index]
          return render(item, rowProps)
        },
      }
    : {}
  const nextProps = t.omit(['box', 'items', 'render'], props)
  return (
    <VStack x="left" y="top" box={{ flex: 1, height: 'full' }} next={box}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            className="scrollbar outline-none"
            {...baseListProps}
            {...nextProps}
          />
        )}
      </AutoSizer>
    </VStack>
  )
})

export class VList extends React.Component {
  render() {
    return renderVList(this.props)
  }
}
VList.displayName = 'VList'
