const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {},
    defaultCommandTimeout: 10000, 
    pageLoadTimeout: 30000,
  },
});
