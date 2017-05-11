// Use JS to support loading of threshold data from external file
var coverageConfig = {
  instrumentation: {
    root: 'src/',
    excludes: ['errors.js']
  },
  check: require('./thresholds.json'),
  reporting: {
    print: 'both',
    dir: 'reports/coverage/',
    reports: [
      'cobertura',
      'html',
      'lcovonly',
      'html',
      'json'
    ],
    'report-config': {
      cobertura: {
        file: 'cobertura/coverage.xml'
      },
      json: {
        file: 'json/coverage.json'
      },
      lcovonly: {
        file: 'lcov/lcov.info'
      },
      text: {
        file: null
      }
    }
  }
};

module.exports = coverageConfig;
