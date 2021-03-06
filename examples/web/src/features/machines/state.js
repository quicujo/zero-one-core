import z from '@z1/lib-feature-box'
import mx from '@z1/lib-feature-macros'
import sc from '@z1/lib-ui-schema'

// parts
import views from './views'

// main
const name = 'machines'
const routeProps = { authenticate: true }
export const stateKit = parts =>
  z.state.create(name, [
    mx.view.configure(name, {
      path: 'machines',
      state: views.state(parts),
      routes: {
        home: routeProps,
        view: routeProps,
        detail: routeProps,
        more: routeProps,
      },
    }),
    parts.registerNav({
      secure: sc.nav.create(n => [
        n('/machines', {
          slot: 'nav',
          label: 'Machines',
          icon: 'laptop',
        }),
      ]),
    }),
  ])

export default stateKit
