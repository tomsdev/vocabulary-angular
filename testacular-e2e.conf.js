basePath = '';

files = [
  ANGULAR_SCENARIO,
  ANGULAR_SCENARIO_ADAPTER,
  'test/e2e/**/*.js'
];

runnerPort = 3501;

autoWatch = true;

browsers = ['Chrome'];

singleRun = false;

proxies = {
  '/app/': 'http://localhost:3501/'
};

junitReporter = {
  outputFile: 'test_out/e2e.xml',
  suite: 'e2e'
};