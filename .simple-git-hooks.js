module.exports = {
  'pre-commit': 'npx lint-staged && npm run build',
  'pre-push': 'npm run build'
} 