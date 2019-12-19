import { task } from '@z1/preset-task'

// parts
import { api } from './api'
import { app } from './app'

// main
export const server = ctx => {
  return {
    app: app(ctx),
    api: api(ctx),
  }
}
