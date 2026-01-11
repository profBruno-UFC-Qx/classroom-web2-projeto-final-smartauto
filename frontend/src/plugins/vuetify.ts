import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
        },
      },
    },
  },
})
