import React from 'react'
import { task, VIEW_STATUS } from '@z1/lib-feature-box'

// main
const nextInitState = task(t => (views = {}) => {
  return {
    viewKey: null,
    route: null,
    views: t.mergeAll(
      t.map(([key, value]) => {
        const viewData = t.pathOr(null, ['data'], value)
        const makeForm = t.pathOr(null, ['form'], value)
        const nextViewData = t.isNil(viewData)
          ? {}
          : t.isType(viewData, 'Function')
          ? viewData({
              type: 'init',
              status: VIEW_STATUS.INIT,
              formData: null,
              viewData: null,
              error: null,
            })
          : viewData
        return {
          [t.caseTo.constantCase(key)]: {
            status: nextViewData.status || VIEW_STATUS.INIT,
            error: nextViewData.error || null,
            detailKey: null,
            moreKey: null,
            data: nextViewData.data || {},
            form: t.isNil(makeForm)
              ? null
              : makeForm({
                  type: 'init',
                  status: nextViewData.status || VIEW_STATUS.INIT,
                  viewData: nextViewData.data,
                  formData: {},
                }),
          },
        }
      }, t.toPairs(views))
    ),
  }
})

const nextRouteState = task(
  t => (boxName = 'box', macroProps = {}) => (state, action) => {
    const viewKey = t.caseTo.constantCase(
      t.pathOr('home', ['payload', 'view'], action)
    )
    const detailKey = t.pathOr(null, ['payload', 'detail'], action)
    const moreKey = t.pathOr(null, ['payload', 'more'], action)
    const viewProps = t.pathOr(null, [viewKey], macroProps)
    const viewData = t.pathOr(null, ['data'], viewProps || {})
    const makeForm = t.pathOr(null, ['form'], viewProps || {})
    const viewState = t.pathOr({}, ['views', viewKey], state)
    const nextViewData = t.isNil(viewData)
      ? viewState.data
      : t.isType(viewData, 'Function')
      ? viewData({
          type: 'route-enter',
          status: VIEW_STATUS.WAITING,
          formData: viewState.formData,
          viewData: viewState.data,
          error: null,
        })
      : viewData
    return t.merge(state, {
      viewKey,
      route: action.type.replace(`${boxName}/`, ''),
      views: t.merge(state.views, {
        [viewKey]: t.mergeAll([
          viewState,
          {
            detailKey,
            moreKey,
            status: nextViewData.status || VIEW_STATUS.WAITING,
            error: null,
            data: nextViewData.data || viewState.data,
          },
          {
            form: t.isNil(makeForm)
              ? viewState.form
              : makeForm({
                  type: 'route-enter',
                  viewData: nextViewData.data || viewState.data,
                  formData: viewState.formData,
                  status: nextViewData.status || VIEW_STATUS.WAITING,
                }),
          },
        ]),
      }),
    })
  }
)

const nextRouteExitState = task(
  t => (boxName = 'box', macroProps = {}) => state => {
    const viewKey = t.caseTo.constantCase(t.pathOr('home', ['viewKey'], state))
    const viewProps = t.pathOr(null, [viewKey], macroProps)
    const viewData = t.pathOr(null, ['data'], viewProps || {})
    const makeForm = t.pathOr(null, ['form'], viewProps || {})
    const viewState = t.pathOr({}, ['views', viewKey], state)
    const nextViewData = t.isNil(viewData)
      ? viewState.data
      : t.isType(viewData, 'Function')
      ? viewData({
          type: 'route-exit',
          status: viewState.status,
          formData: viewState.formData,
          viewData: viewState.data,
          error: null,
        })
      : viewData
    return t.merge(state, {
      views: t.merge(state.views, {
        [viewKey]: t.mergeAll([
          viewState,
          {
            status: nextViewData.status || viewState.status,
            error: null,
            data: nextViewData.data || viewState.data,
          },
          {
            form: t.isNil(makeForm)
              ? viewState.form
              : makeForm({
                  type: 'route-exit',
                  viewData: nextViewData.data || viewState.data,
                  formData: viewState.formData,
                  status: nextViewData.status || viewState.status,
                }),
          },
        ]),
      }),
    })
  }
)

const nextViewState = task(
  t => (boxName = 'box', macroProps = {}) => (state, action) => {
    const data = t.pathOr(null, [state.viewKey, 'data'], macroProps)
    const form = t.pathOr(null, [state.viewKey, 'form'], macroProps)
    const viewState = t.pathOr({}, ['views', state.viewKey], state)
    const formData = t.pathOr({}, ['form', 'data'], viewState)
    const type = t.caseTo.paramCase(action.type.replace(`${boxName}/`, ''))
    const nextViewState = t.isType(data, 'Function')
      ? t.merge(
          t.path(['views', state.viewKey], state),
          data({
            type,
            viewData: action.payload.data || viewState.data,
            formData,
            status: action.payload.status || viewState.status,
            error: action.payload.error || viewState.error,
          })
        )
      : t.merge(t.path(['views', state.viewKey], state), {
          status: action.payload.status || VIEW_STATUS.READY,
          data: action.payload.data || viewState.data,
          error: action.payload.error || viewState.error,
        })
    const nextForm = t.isType(form, 'Function')
      ? form({
          type,
          formData,
          viewData: nextViewState.data,
          status: nextViewState.status,
        })
      : t.path(['views', state.viewKey, 'form'], state)
    return t.merge(state, {
      views: t.merge(state.views, {
        [state.viewKey]: t.merge(nextViewState, { form: nextForm }),
      }),
    })
  }
)

const nextFormState = task(
  t => (boxName = 'box', macroProps = {}) => (state, action) => {
    const form = t.pathOr(null, [state.viewKey, 'form'], macroProps)
    const data = t.pathOr(null, [state.viewKey, 'data'], macroProps)
    if (t.isNil(form)) {
      return state
    }
    const currentView = t.pathOr({}, ['views', state.viewKey], state)
    const type = t.caseTo.paramCase(action.type.replace(`${boxName}/`, ''))
    const matchType = t.getMatch(type)
    const nextStatus = matchType({
      'form-change': currentView.status,
      'form-transmit': VIEW_STATUS.LOADING,
      'form-transmit-complete': action.payload.status || currentView.status,
    })
    const viewState = t.merge(currentView, { status: nextStatus })
    const formState = t.pathOr({}, ['form'], viewState)
    const nextViewState = matchType({
      'form-change': viewState,
      'form-transmit': viewState,
      'form-transmit-complete': t.isType(data, 'Function')
        ? data({
            type,
            status: viewState.status,
            viewData: viewState.data,
            formData: action.payload.data || formState.data,
            error: action.payload.error || viewState.error,
          })
        : viewState,
    })
    const nextFormState = form({
      type,
      status: nextViewState.status,
      viewData: nextViewState.data,
      formData: action.payload.data || formState.data,
    })
    return t.merge(state, {
      views: t.merge(state.views, {
        [state.viewKey]: t.mergeAll([
          viewState,
          nextViewState,
          {
            form: t.merge(formState, nextFormState),
          },
        ]),
      }),
    })
  }
)

const matchBoxRoutes = task(t => boxName =>
  t.globrex(`${boxName}/ROUTE_*`).regex
)
const matchNotBoxRoutes = task(t => boxName =>
  t.globrex(`!(${boxName})*/ROUTE_*`, { extended: true }).regex
)

export const macroRouteViewState = task(
  (t, a) => (boxName = 'box', props = {}) => {
    const path = t.pathOr('/', ['path'], props)
    const defaultRouteProps = { authenticate: false }
    const routeProps = t.pathOr(
      {
        home: defaultRouteProps,
        view: defaultRouteProps,
        detail: defaultRouteProps,
        more: defaultRouteProps,
      },
      ['routes'],
      props
    )
    const macroProps = t.pathOr({}, ['views'], props)
    return {
      initial: nextInitState(macroProps),
      mutations(m) {
        return [
          m(
            ['routeHome', 'routeView', 'routeViewDetail', 'routeViewMore'],
            nextRouteState(boxName, macroProps)
          ),
          m('routeExit', nextRouteExitState(boxName, macroProps)),
          m(
            ['dataChange', 'dataLoad', 'dataLoadComplete'],
            nextViewState(boxName, macroProps)
          ),
          m(
            ['formChange', 'formTransmit', 'formTransmitComplete'],
            nextFormState(boxName, macroProps)
          ),
        ]
      },
      routes(r, actions) {
        return [
          r(actions.routeHome, path, routeProps.home || defaultRouteProps),
          r(
            actions.routeView,
            `${path}:view`,
            routeProps.view || defaultRouteProps
          ),
          r(
            actions.routeViewDetail,
            `${path}:view/:detail`,
            routeProps.detail || defaultRouteProps
          ),
          r(
            actions.routeViewMore,
            `${path}:view/:detail/:more`,
            routeProps.more || defaultRouteProps
          ),
        ]
      },
      effects(fx, box) {
        const matchRoutes = matchBoxRoutes(boxName)
        return [
          fx(
            [matchNotBoxRoutes(boxName)],
            async ({ getState }, dispatch, done) => {
              const state = getState()
              if (matchRoutes.test(state.location.prev.type)) {
                dispatch(
                  box.mutations.routeExit({ route: state.location.prev.type })
                )
              }
              done()
            }
          ),
          fx(
            [matchRoutes, box.actions.dataLoad],
            async ({ getState, api, action, redirect }, dispatch, done) => {
              const state = t.pathOr({}, [boxName], getState())
              const viewLoad = t.pathOr(
                null,
                [state.viewKey, 'load'],
                macroProps
              )
              if (t.isNil(viewLoad)) {
                dispatch(
                  box.mutations.dataLoadComplete({
                    status: VIEW_STATUS.READY,
                  })
                )
                done()
              } else {
                const viewData = t.pathOr(
                  {},
                  ['views', state.viewKey, 'data'],
                  state
                )
                const formData = t.pathOr(
                  {},
                  ['views', state.viewKey, 'form', 'data'],
                  state
                )
                const detailKey = t.pathOr(
                  null,
                  ['views', state.viewKey, 'detailKey'],
                  state
                )
                const moreKey = t.pathOr(
                  null,
                  ['views', state.viewKey, 'moreKey'],
                  state
                )
                const type = t.eq(action.type, box.actions.dataLoad)
                  ? 'data-load'
                  : 'route-enter'
                const [loadError, loadResult] = await a.of(
                  viewLoad({
                    type,
                    action,
                    getState,
                    dispatch,
                    redirect,
                    mutations: box.mutations,
                    api,
                    detailKey,
                    moreKey,
                    status: VIEW_STATUS.READY,
                    viewData,
                    formData,
                  })
                )
                if (loadError) {
                  dispatch(
                    box.mutations.dataLoadComplete({
                      error: loadError,
                      data: null,
                      status: VIEW_STATUS.READY,
                    })
                  )
                } else {
                  dispatch(
                    box.mutations.dataLoadComplete({
                      error: loadResult.error || null,
                      data: loadResult.data,
                      status: loadResult.status || VIEW_STATUS.READY,
                    })
                  )
                }
                done()
              }
            }
          ),
          fx(
            [box.actions.formTransmit],
            async ({ getState, action, api, redirect }, dispatch, done) => {
              const state = t.pathOr({}, [boxName], getState())
              const transmit = t.pathOr(
                null,
                [state.viewKey, 'transmit'],
                macroProps
              )
              if (t.notType(transmit, 'Function')) {
                done()
              } else {
                const viewData = t.pathOr(
                  {},
                  ['views', state.viewKey, 'data'],
                  state
                )
                const formData = t.pathOr(
                  {},
                  ['views', state.viewKey, 'form', 'data'],
                  state
                )
                const detailKey = t.pathOr(
                  null,
                  ['views', state.viewKey, 'detailKey'],
                  state
                )
                const moreKey = t.pathOr(
                  null,
                  ['views', state.viewKey, 'moreKey'],
                  state
                )
                const [transmitError, transmitResult] = await a.of(
                  transmit({
                    type: 'form-transmit',
                    action,
                    getState,
                    dispatch,
                    redirect,
                    mutations: box.mutations,
                    api,
                    detailKey,
                    moreKey,
                    status: VIEW_STATUS.READY,
                    viewData,
                    formData,
                  })
                )
                if (transmitError) {
                  dispatch(
                    box.mutations.formTransmitComplete({
                      error: transmitError,
                      data: null,
                      status: VIEW_STATUS.READY,
                    })
                  )
                } else {
                  dispatch(
                    box.mutations.formTransmitComplete({
                      error: transmitResult.error || null,
                      data: transmitResult.data || null,
                      status: transmitResult.status || VIEW_STATUS.READY,
                    })
                  )
                }
                done()
              }
            }
          ),
        ]
      },
    }
  }
)

// ui
export const createView = task(t => (key, { state, ui }) => {
  key = key || 'NOT_FOUND'
  return { key: t.caseTo.constantCase(key), state, ui }
})

export const combineViews = task(t => (viewList = []) => {
  const nextResult = t.reduce(
    (result, view) => {
      return t.merge(result, {
        state: t.merge(result.state, {
          [view.key]: view.state || {},
        }),
        ui: t.merge(result.ui, {
          [view.key]: view.ui || null,
        }),
      })
    },
    { state: {}, ui: {} },
    viewList
  )
  return {
    state: nextResult.state,
    ui: props =>
      t.mapObjIndexed(V => (t.isNil(V) ? V : V(props)), nextResult.ui),
  }
})

export const renderView = task(
  t => (Views = null, state = {}, mutations = {}) => {
    if (t.isNil(Views)) {
      return null
    }
    const data = t.pathOr({}, ['views', state.viewKey], state)
    const View = Views[state.viewKey]
    return t.isNil(View)
      ? t.has('NOT_FOUND')(Views)
        ? React.createElement(Views.NOT_FOUND, { state: data, mutations })
        : null
      : React.createElement(View, { state: data, mutations })
  }
)

export const routeActions = task(t => (actions = {}) =>
  t.filter(
    action => t.globrex('*/ROUTE_*').regex.test(action),
    t.map(([_, value]) => value, t.toPairs(actions))
  )
)
