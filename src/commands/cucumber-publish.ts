import {Command, flags} from '@oclif/command'

import {Cucumber} from '../utils/cuccumber/cucumber'
import * as cf from '../utils/common-flags'
import * as core from '@actions/core'

export default class CucumberPublish extends Command {
  static description = 'describe the command here'

  static flags = {
    ...cf.commonFlags,

    reportPath: flags.string(
      {
        char: 'f',
        description: 'report paths like: **/cucumber_report.json',
        default: '**/cucumber_report.json',
        required: false,
      },
    ),

    checkName: flags.string(
      {
        description: 'Check Name',
        required: true,
      },
    ),
  }

  async run() {
    const {flags} = this.parse(CucumberPublish)
    const ghAppVars = cf.getGhAppProps(flags)
    await new Cucumber().publishAsCheck({
      ...ghAppVars,
      reportPath: flags.reportPath,
      commit: flags.commit,
      repoOwner: flags.repoOwner,
      repoName: flags.repoName,
      checkStatus: flags.checkStatus,
      detailsUrl: flags.detailsUrl,
      checkName: flags.checkName,
      checkConclusion: flags.checkConclusion,
    })
    core.info(`🚀 Publish results: ${flags.commit} ${flags.repoOwner}/${flags.repoName} ${flags.checkConclusion}`)
    core.info(`🚀 Details URL: ${flags.detailsUrl}`)
  }
}
