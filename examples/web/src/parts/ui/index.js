import z from '@z1/lib-feature-box'
import el from '@z1/lib-ui-box-elements'

// common
import { dateFn, bytes, icons } from './common'

// elements
import { Alert } from './Alert'
import { Form } from './Form'
import { IconLabel } from './IconLabel'
import { ListItem } from './ListItem'
import { Modal } from './Modal'
import { Page } from './Page'
import { VList } from './VList'

// main
export const ui = {
  ...el,
  Link: z.ui.Link,
  NavLink: z.ui.NavLink,
  Alert,
  Form,
  IconLabel,
  ListItem,
  Modal,
  Page,
  VList,
  dateFn,
  bytes,
  icons,
}
