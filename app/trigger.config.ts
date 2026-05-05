import { defineConfig } from '@trigger.dev/sdk'

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? 'proj_replace_with_your_ref',
  dirs: ['./trigger'],
  maxDuration: 300, // 5 min max por tarea
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 2000,
      maxTimeoutInMs: 30000,
      factor: 2,
    },
  },
})
