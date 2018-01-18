export default {
  // required ['debug', 'info', 'warn', 'error', 'fatal']
  logLevel: process.env.LOG_LEVEL,
  // optional : defaults to false if not specified
  stringifyArguments: false,
  // optional : defaults to false if not specified
  showLogLevel: true,
  // optional : defaults to false if not specified
  showMethodName: true,
  // optional : defaults to '|' if not specified
  separator: '|',
  // optional : defaults to false if not specified
  showConsoleColors: true
}
