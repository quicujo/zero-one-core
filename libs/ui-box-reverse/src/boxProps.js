import { task } from '@z1/preset-task'

// tasks
const rejoin = task(t => list =>
  t.reduce(
    (state, next) => {
      return t.isZeroLen(state) ? next : `${state}-${next}`
    },
    '',
    list
  )
)
const rejoinFiltered = task(t => (key, list) =>
  t.isType(key, 'Array')
    ? rejoin(t.filter(prop => t.not(t.contains(prop, key)), list))
    : rejoin(t.filter(prop => t.not(t.eq(key, prop)), list))
)

const macroBoolProp = task(t => ({ base, mod }) => {
  if (t.and(t.isZeroLen(base), t.isZeroLen(mod))) {
    return null
  }
  if (t.isZeroLen(mod)) {
    return true
  }
  return [
    t.isZeroLen(base) ? null : true,
    t.mergeAll(
      t.map(item => {
        return { [item.prefix]: true }
      }, mod)
    ),
  ]
})
const macroFilteredKeyProp = task(t => (propKey, { base, mod }) => {
  if (t.and(t.isZeroLen(base), t.isZeroLen(mod))) {
    return null
  }
  if (t.isZeroLen(mod)) {
    return rejoinFiltered(propKey, t.pathOr([], ['chunks'], t.head(base)))
  }
  return [
    t.isZeroLen(base)
      ? null
      : rejoinFiltered(propKey, t.pathOr([], ['chunks'], t.head(base))),
    t.mergeAll(
      t.map(item => {
        return {
          [item.prefix]: rejoinFiltered(
            propKey,
            t.pathOr([], ['chunks'], item)
          ),
        }
      }, mod)
    ),
  ]
})

// main
export const boxProps = task(t => ({
  container(props) {
    return macroBoolProp(props)
  },
  display({ base, mod }) {
    if (t.and(t.isZeroLen(base), t.isZeroLen(mod))) {
      return null
    }
    if (t.isZeroLen(mod)) {
      return t.pathOr(null, ['css'], t.head(base))
    }
    return [
      t.isZeroLen(base) ? null : t.pathOr(null, ['css'], t.head(base)),
      t.mergeAll(
        t.map(item => {
          return { [item.prefix]: t.pathOr(null, ['css'], item) }
        }, mod)
      ),
    ]
  },
  clearfix(props) {
    return macroBoolProp(props)
  },
  float(props) {
    return macroFilteredKeyProp('float', props)
  },
  objectFit(props) {
    return macroFilteredKeyProp('object', props)
  },
  objectPosition(props) {
    return macroFilteredKeyProp('object', props)
  },
  overflow(props) {
    return macroFilteredKeyProp('overflow', props)
  },
  overflowX(props) {
    return macroFilteredKeyProp(['overflow', 'x'], props)
  },
  overflowY(props) {
    return macroFilteredKeyProp(['overflow', 'y'], props)
  },
  scrolling(props) {
    return null
  },
  position(props) {
    return null
  },
  inset(props) {
    return null
  },
  insetX(props) {
    return null
  },
  insetY(props) {
    return null
  },
  pin(props) {
    return null
  },
  visible(props) {
    return null
  },
  zIndex(props) {
    return null
  },
  borderColor(props) {
    return null
  },
  borderStyle(props) {
    return null
  },
  borderWidth(props) {
    return null
  },
  borderRadius(props) {
    return null
  },
  width(props) {
    return null
  },
  minWidth(props) {
    return null
  },
  maxWidth(props) {
    return null
  },
  height(props) {
    return null
  },
  minHeight(props) {
    return null
  },
  maxHeight(props) {
    return null
  },
  color(props) {
    return null
  },
  fontFamily(props) {
    return null
  },
  fontSize(props) {
    return null
  },
  fontSmoothing(props) {
    return null
  },
  fontStyle(props) {
    return null
  },
  fontWeight(props) {
    return null
  },
  letterSpacing(props) {
    return null
  },
  lineHeight(props) {
    return null
  },
  listType(props) {
    return null
  },
  listPosition(props) {
    return null
  },
  textAlignX(props) {
    return null
  },
  textAlignY(props) {
    return null
  },
  textDecoration(props) {
    return null
  },
  textTransform(props) {
    return null
  },
  whitespace(props) {
    return null
  },
  wordBreak(props) {
    return null
  },
  flex(props) {
    return null
  },
  flexDirection(props) {
    return null
  },
  flexWrap(props) {
    return null
  },
  alignItems(props) {
    return null
  },
  alignContent(props) {
    return null
  },
  alignSelf(props) {
    return null
  },
  justifyContent(props) {
    return null
  },
  flexGrow(props) {
    return null
  },
  flexShrink(props) {
    return null
  },
  flexOrder(props) {
    return null
  },
  tableCollapse(props) {
    return null
  },
  tableLayout(props) {
    return null
  },
  bgAttachment(props) {
    return null
  },
  bgColor(props) {
    return null
  },
  bgPosition(props) {
    return null
  },
  bgRepeat(props) {
    return null
  },
  bgSize(props) {
    return null
  },
  padding(props) {
    return null
  },
  margin(props) {
    return null
  },
  appearance(props) {
    return null
  },
  cursor(props) {
    return null
  },
  outline(props) {
    return null
  },
  pointerEvents(props) {
    return null
  },
  resize(props) {
    return null
  },
  userSelect(props) {
    return null
  },
  shadow(props) {
    return null
  },
  opacity(props) {
    return null
  },
  fill(props) {
    return null
  },
  stroke(props) {
    return null
  },
}))
