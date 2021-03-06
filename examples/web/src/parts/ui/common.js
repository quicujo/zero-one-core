import React from 'react'
import z from '@z1/lib-feature-box'
import { Row } from '@z1/lib-ui-box-elements'
import prettyBytes from 'pretty-bytes'
/* NOTE: pluralize is 17kb - useful as it is use on when needed
import pluralize from 'pluralize'
*/
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

// main
export const bytes = prettyBytes
/* export const plural = pluralize */
export const dateFn = dayjs
export const isRenderProp = z.fn(t => prop =>
  t.isNil(prop) ? false : t.isType(prop, 'function')
)
const textProps = {
  x: 'left',
  y: 'center',
  box: {
    display: 'inline-flex',
    alignSelf: 'auto',
    lineHeight: 'tight',
    wordBreak: 'truncate',
  },
}
export const renderText = z.fn(t => (props, baseProps = {}) => {
  const defaultProps = t.mergeDeepRight(textProps, baseProps)
  if (isRenderProp(props)) {
    return props(defaultProps)
  }
  if (t.isType(props, 'string')) {
    return <Row {...defaultProps}>{props}</Row>
  }
  const text = t.atOr(null, 'text', props)
  if (t.notNil(text)) {
    const nextProps = t.omit(['text'], props)
    return (
      <Row {...defaultProps} {...nextProps}>
        {text}
      </Row>
    )
  }
  const nextProps = t.omit(['children'], props)
  return (
    <Row {...defaultProps} {...nextProps}>
      {props.children}
    </Row>
  )
})

const loginIcon = z.fn(t =>
  t.match({
    _: 'user-astronaut',
    agent: 'user-secret',
    bot: 'robot',
    robot: 'robot',
    service: 'terminal',
    supervisor: 'user-shield',
  })
)
const machineIcon = z.fn(t =>
  t.pipe(
    type => `${type}`,
    t.to.lowerCase,
    type =>
      t.includes('windows', type)
        ? 'windows'
        : t.includes('linux', type)
        ? 'linux'
        : t.includes('darwin', type)
        ? 'apple'
        : 'laptop'
  )
)

const fileIcon = z.fn(t =>
  t.pipe(
    ext => `${ext}`,
    t.to.lowerCase,
    ext =>
      t.eq(ext, 'csv')
        ? { name: 'file-csv', color: 'green-600' }
        : t.eq(ext, 'pdf')
        ? { name: 'file-pdf', color: 'red-400' }
        : t.includes(ext, ['png', 'jpg', 'jpeg', 'gif'])
        ? { name: 'file-image', color: 'purple-400' }
        : t.includes(ext, ['zip', 'rar', 'gzip', '7zip'])
        ? { name: 'file-archive', color: 'yellow-500' }
        : t.includes(ext, [
            'svg',
            'js',
            'jsx',
            'ts',
            'tsx',
            'json',
            'css',
            'scss',
            'html',
            'htm',
            'py',
            'md',
            'rs',
            'cs',
            'ex',
            'xml',
          ])
        ? { name: 'file-code', color: 'yellow-400' }
        : t.includes(ext, ['doc', 'docx', 'word'])
        ? { name: 'file-word', color: 'blue-400' }
        : t.includes(ext, ['xls', 'xlsx', 'excel'])
        ? { name: 'file-excel', color: 'green-400' }
        : t.includes(ext, ['ppt', 'pptx', 'powerpoint'])
        ? { name: 'file-powerpoint', color: 'orange-400' }
        : { name: 'file-alt', color: 'gray-200' }
  )
)

export const icons = { login: loginIcon, machine: machineIcon, file: fileIcon }
