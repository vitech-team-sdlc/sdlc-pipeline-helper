import {Command, flags} from '@oclif/command'

import {Junit} from '../utils/junit/junit'
import * as cf from '../utils/common-flags'

export default class JunitReportPublish extends Command {
  static description = 'describe the command here'

  static examples = [
    '$ sdlcpipelinehelper junit-report-publish --reportPaths="**/test-results/**/TEST-*.xml" --commit="$PULL_PULL_SHA"',
  ]

  static flags = {
    ...cf.commonFlags,

    reportPaths: flags.string(
      {
        char: 'f',
        description: 'report paths like: **/test-results/**/TEST-*.xml ',
        required: true,
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
    const {flags} = this.parse(JunitReportPublish)
    const ghAppVars = cf.getGhAppProps(flags)

    await new Junit().publish({
      ...ghAppVars,
      commit: flags.commit,
      repoOwner: flags.repoOwner,
      repoName: flags.repoName,
      checkStatus: flags.checkStatus,
      reportPaths: flags.reportPaths,
      detailsUrl: flags.detailsUrl,
      checkName: flags.checkName,
    })
  }
}

