const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

const { copyDir, replaceAll, colorize } = require('./util')
const { packageRootPath } = require('./paths')

const { version } = require('../package.json')

async function create({ projectName, projectFolderName }) {
  const folderNameToUse = projectFolderName || projectName
  const pathToUse = path.resolve(process.cwd(), folderNameToUse)
  console.log(`Creating project ${colorize(projectName).FgCyan()} in ${colorize(pathToUse).FgCyan()}...`)

  const packageJSONTemplate = fs.readFileSync(path.resolve(__dirname, './templates/package.template.json'))
  let packageJSON = replaceAll(packageJSONTemplate.toString(), '{-- project-name --}', projectName)
  packageJSON = replaceAll(packageJSON.toString(), '{-- project-version --}', version)

  await copyDir({
    source     : path.resolve(__dirname, '..', 'template'),
    destination: pathToUse
  })

  // Create real package.json
  fs.writeFileSync(path.join(pathToUse, 'package.json'), packageJSON)

  const vscodeConfigTemplate = fs.readFileSync(path.resolve(__dirname, './templates/settings.template.json'))
  const vscodeConfig = replaceAll(vscodeConfigTemplate.toString(), '{-- eslintrcPath --}', path.join(packageRootPath, '.eslintrc'))

  const vscodeFolder = path.join(pathToUse, '.vscode')
  if(!fs.existsSync(vscodeFolder)) fs.mkdirSync(vscodeFolder)

  fs.writeFileSync(path.join(vscodeFolder, 'settings.json'), vscodeConfig)

  // Install all dependencies
  setTimeout(() => {
    childProcess.spawnSync('yarn', {
      cwd  : pathToUse,
      stdio: 'inherit'
    })
    childProcess.execSync('git init . && git add . && git commit -m "Initialized app with crassa!"', { cwd: pathToUse })
    console.log(colorize('Project was successfully created.').FgGreen())
    console.log(colorize('To get started, execute:').FgCyan())
    console.log(colorize(`cd ${folderNameToUse}`).Underscore())
    console.log(colorize('npm run dev').Underscore())
  }, 300)
}

module.exports = create
