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
  }

  async run() {
    const {flags} = this.parse(JunitReportPublish)

    const appId = flags.appId || process.env.GH_APP_ID
    const privateKey = flags.privateKey || process.env.GH_APP_PRIVATE_KEY
    const installationId = flags.installationId || process.env.GH_APP_INSTALLATION_ID

    await new Junit().publish({
      appId: this.requiredVar(appId, 'appId flag or GH_APP_ID environment variable is required'),
      privateKey: this.requiredVar(privateKey, 'privateKey flag or GH_APP_PRIVATE_KEY environment variable is required'),
      installationId: this.requiredVar(installationId, 'installationId flag or GH_APP_INSTALLATION_ID environment variable is required'),
      commit: flags.commit,
      repoOwner: flags.repoOwner,
      repoName: flags.repoName,
      checkStatus: flags.checkStatus,
      reportPaths: flags.reportPaths,
      detailsUrl: flags.detailsUrl,
    })
  }

  requiredVar(value: string | undefined, error: string): string {
    if (value === undefined || value.length === 0) {
      throw new Error(error)
    }
    return value
  }
}

