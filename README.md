# Arcane Build Process
Currently built on Gulpjs

## Install on a new project
1) `npx install-peerdeps --dev arcane-gulp`
2) Create a `gulpfile.js`
    ```javascript
    const tasks = require('arcane-gulp');
       
    tasks.config({
       source: {
           file: ['test/files/**/*.*'],
           image: 'src/images',
           script: 'test/scripts',
           style: 'test/styles/*.scss',
       },
       destination: {
           image: 'public/assets/images',
           script: 'public/assets/scripts',
           style: 'public/assets/styles',
           file: 'public/assets',
       },
    });
    
    // Gulp does not support ES module exports, default to older syntax to
    // expose tasks to Gulp CLI
    module.exports = tasks;
    ```
3) Add the following tasks to your `package.json`
    ```json5
      "scripts": {
        "dev": "npm run development",
        "development": "cross-env NODE_ENV=development gulp",
        "prod": "npm run production",
        "production": "cross-env NODE_ENV=production gulp"
      }
    ```
