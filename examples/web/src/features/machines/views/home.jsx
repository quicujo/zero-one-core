import React from 'react'
import mx from '@z1/lib-feature-macros'

// parts
import { aliasForm, machineModal } from './parts'

// main
export const home = mx.fn(t =>
  mx.view.create('home', {
    state(ctx) {
      const forms = {
        machine: {
          entity: 'machines',
          ui: aliasForm(ctx, 'machine'),
        },
        login: {
          entity: 'machines.logins',
          ui: aliasForm(ctx, 'login'),
        },
      }
      return {
        initial: ctx.macro.initial(
          {
            machines: [],
          },
          forms
        ),
        data(props) {
          return ctx.macro.data(props)
        },
        async load(props) {
          return await ctx.macro.load(
            [
              {
                entity: 'machines',
                method: props.api.service('machines').find({
                  query: {
                    $sort: {
                      updatedAt: -1,
                    },
                    $limit: 10000,
                  },
                }),
                resultAt: 'data',
              },
            ],
            props
          )
        },
        subscribe(props) {
          const mutator = t.at('mutators.dataChange', props)
          const events = ['created', 'patched']
          return ctx.macro.subscribe([
            {
              id: '_id',
              entity: 'machines',
              service: props.api.service('machines'),
              events,
              mutator,
            },
            {
              id: '_id',
              parent: 'machineId',
              entity: 'machines.logins',
              service: props.api.service('machine-logins'),
              events,
              mutator,
            },
          ])
        },
        form(props) {
          return ctx.macro.form(forms, props)
        },
        async transmit(props) {
          return await ctx.macro.transmit(
            [
              {
                form: 'machine',
                method: data =>
                  t.isNil(data._id)
                    ? null
                    : props.api
                        .service('machines')
                        .patch(data._id, t.pick(['alias'], data)),
              },
              {
                form: 'login',
                method: data =>
                  t.isNil(data._id)
                    ? null
                    : props.api
                        .service('machine-logins')
                        .patch(data._id, t.pick(['alias'], data)),
              },
            ],
            props
          )
        },
        modal(props) {
          return ctx.macro.modal({ autoClose: true }, props)
        },
      }
    },
    ui(ctx) {
      const MachineModal = machineModal(ctx)
      const itemHeight = {
        main: 90,
        nested: 76,
      }
      return props => {
        const machines = t.atOr([], 'state.data.machines', props)
        const status = t.at('state.status', props)
        return (
          <ctx.Page
            key="machines"
            loading={t.includes(status, [ctx.status.init, ctx.status.waiting])}
            render={() => (
              <React.Fragment>
                <ctx.IconLabel
                  slots={{
                    label: {
                      padding: { left: 2 },
                    },
                  }}
                  icon={{ name: 'laptop', size: '3xl', color: 'blue-500' }}
                  label={{
                    text: 'Machines',
                    fontWeight: 'bold',
                    fontSize: 'xl',
                  }}
                  margin={{ bottom: 4 }}
                />
                <ctx.VList
                  key="machine-list"
                  items={machines}
                  rowHeight={({ index }) => {
                    const machine = machines[index]
                    return t.isNil(machine)
                      ? itemHeight.main
                      : itemHeight.nested *
                          t.len(t.atOr([], 'logins', machine)) +
                          itemHeight.main
                  }}
                  render={(machine, rowProps) => {
                    return (
                      <ctx.ListItem
                        key={rowProps.key}
                        style={rowProps.style}
                        borderRadius="sm"
                        transition="bg"
                        margin={{ bottom: 1 }}
                        slots={{
                          main: {
                            padding: { x: 3, y: 3 },
                          },
                        }}
                        avatar={{
                          icon: ctx.icons.machine(machine.type),
                          fill: 'ghost',
                          color: 'blue-500',
                          size: 'lg',
                        }}
                        title={{
                          label: {
                            text: machine.alias,
                            fontSize: 'lg',
                            letterSpacing: 'wide',
                            margin: { bottom: 2 },
                          },
                          info: {
                            text: `${machine.distro} v${machine.release} ${machine.arch}`,
                            fontSize: 'sm',
                            color: 'blue-500',
                          },
                        }}
                        subtitle={{
                          icon: { name: 'laptop', size: 'lg' },
                          label: {
                            text: machine.hardwareuuid,
                            fontSize: 'xs',
                            fontWeight: 'light',
                          },
                          color: 'gray-400',
                        }}
                        stamp={{
                          icon: 'clock',
                          label: {
                            text: ctx
                              .dateFn(machine.updatedAt)
                              .format('YYYY MM DD HH:mm:ss A'),
                            fontSize: 'xs',
                            fontWeight: 'light',
                          },
                          margin: { bottom: 2 },
                        }}
                        buttons={[
                          {
                            icon: 'gear',
                            shape: 'circle',
                            fill: 'ghost-solid',
                            size: 'xs',
                            color: 'blue-500',
                            disabled: t.eq(
                              ctx.status.loading,
                              t.at('state.status', props)
                            ),
                            onClick: () =>
                              props.mutations.modalChange({
                                open: true,
                                active: 'machine',
                                id: machine._id,
                                title: {
                                  icon: {
                                    name: 'laptop',
                                    color: 'blue-500',
                                    fontSize: '2xl',
                                  },
                                  label: {
                                    text: 'Machine',
                                    color: 'blue-500',
                                    fontSize: 'lg',
                                  },
                                },
                                text:
                                  'Enter an alias for this machine below to continue.',
                              }),
                          },
                          {
                            icon: 'arrow-circle-right',
                            shape: 'circle',
                            fill: 'ghost-solid',
                            size: 'xs',
                            color: 'blue-500',
                            as: ctx.Link,
                            to: `/machines/profile/${machine._id}`,
                          },
                        ]}
                      >
                        <ctx.MapIndexed
                          items={t.atOr([], 'logins', machine)}
                          render={(login, index) => {
                            const online = t.eq('online', login.status)
                            return (
                              <ctx.ListItem
                                key={`nested_login_${login._id}_${index}`}
                                width="full"
                                transition="bg"
                                margin={{ bottom: 1 }}
                                slots={{
                                  main: {
                                    padding: { x: 3, y: 2 },
                                    bgColor: [
                                      'gray-800',
                                      { hover: 'gray-700' },
                                    ],
                                  },
                                }}
                                avatar={{
                                  icon: ctx.icons.login(login.role),
                                  size: 'md',
                                  fill: 'ghost',
                                  color: 'yellow-500',
                                }}
                                title={{
                                  label: {
                                    text: login.alias,
                                    fontSize: 'md',
                                    fontWeight: 'light',
                                    letterSpacing: 'wider',
                                    margin: { bottom: 2 },
                                  },
                                  info: {
                                    text: login.role,
                                    fontSize: 'sm',
                                    fontWeight: 'medium',
                                    letterSpacing: 'wide',
                                    color: 'yellow-500',
                                  },
                                }}
                                stamp={{
                                  icon: 'clock',
                                  label: {
                                    text: ctx
                                      .dateFn()
                                      .to(ctx.dateFn(login.updatedAt)),
                                    fontSize: 'xs',
                                    fontWeight: 'light',
                                  },
                                  margin: { bottom: 2 },
                                }}
                                status={{
                                  icon: { name: 'power-off', size: 'lg' },
                                  label: {
                                    text: login.status,
                                    fontSize: 'sm',
                                    fontWeight: online ? 'medium' : 'light',
                                    letterSpacing: 'wide',
                                  },
                                  color: online ? 'green-500' : 'gray-500',
                                }}
                                buttons={[
                                  {
                                    icon: 'gear',
                                    shape: 'circle',
                                    fill: 'ghost-solid',
                                    size: 'xs',
                                    color: 'blue-500',
                                    margin: { left: 1 },
                                    disabled: t.eq(
                                      ctx.status.loading,
                                      t.at('state.status', props)
                                    ),
                                    onClick: () =>
                                      props.mutations.modalChange({
                                        open: true,
                                        active: 'login',
                                        id: login._id,
                                        title: {
                                          icon: {
                                            name: 'user-circle',
                                            color: 'blue-500',
                                            fontSize: '2xl',
                                          },
                                          label: {
                                            text: 'Machine Login',
                                            color: 'blue-500',
                                            fontSize: 'lg',
                                          },
                                        },
                                        text:
                                          'Enter an alias for this login below to continue.',
                                      }),
                                  },
                                  {
                                    icon: 'arrow-circle-right',
                                    shape: 'circle',
                                    fill: 'ghost-solid',
                                    size: 'xs',
                                    color: 'blue-500',
                                    margin: { left: 1 },
                                    as: ctx.Link,
                                    to: `/machines/login/${login._id}`,
                                  },
                                ]}
                              />
                            )
                          }}
                        />
                      </ctx.ListItem>
                    )
                  }}
                />
                <MachineModal key="view-modal" {...props} />
              </React.Fragment>
            )}
          />
        )
      }
    },
  })
)
