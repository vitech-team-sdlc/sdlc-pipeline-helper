import {Command, flags} from '@oclif/command'
import {Sarif} from '../utils/sarif/sarif'
import * as cf from '../utils/common-flags'
import * as core from '@actions/core'

export default class SarifPublish extends Command {
  static description = 'Convert SARIF report into markdown format and publish it as Quality Check'

  static flags = {
    ...cf.commonFlags,

    checkName: flags.string(
      {
        description: 'check name',
        required: true,
      },
    ),
    sourceRoot: flags.string(
      {
        description: 'sourceRoot DIR',
        required: true,
      },
    ),

  }

  async run() {
    const {flags} = this.parse(SarifPublish)
    const ghAppVars = cf.getGhAppProps(flags)
    await new Sarif().publishAsCheck({
      ...ghAppVars,
      commit: flags.commit,
      repoOwner: flags.repoOwner,
      repoName: flags.repoName,
      checkStatus: flags.checkStatus,
      sourceRoot: flags.sourceRoot,
      detailsUrl: flags.detailsUrl,
      checkName: flags.checkName,
      checkConclusion: flags.checkConclusion,
    })
    core.info(`🚀 Publish results: ${flags.commit} ${flags.repoOwner}/${flags.repoName} ${flags.checkConclusion}`)
    core.info(`🚀 Details URL: ${flags.detailsUrl}`)
  }
}
