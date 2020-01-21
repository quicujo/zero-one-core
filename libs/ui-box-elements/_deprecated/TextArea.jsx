import React from 'react'
import { fn } from '@z1/lib-ui-box'

// elements
import { Box } from '../Box'

// main
const renderTextArea = fn(t => props => {
  const as = t.pathOr('textarea', ['as'], props)
  const className = t.pathOr(null, ['className'], props)
  return React.createElement(
    Box,
    t.merge(t.omit(['as', 'className', 'box'], props), {
      as,
      className: `form-textarea${t.isNil(className) ? '' : ` ${className}`}`,
      box: t.merge(
        {
          display: 'block',
          width: 'full',
        },
        t.pathOr({}, ['box'], props)
      ),
    })
  )
})

export class TextArea extends React.Component {
  render() {
    return renderTextArea(this.props)
  }
}