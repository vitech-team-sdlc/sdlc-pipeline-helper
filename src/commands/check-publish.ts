import {Command, flags} from '@oclif/command'
import * as cf from '../utils/common-flags'
import GithubCheckPublisher from '../utils/github-check-publisher'

export default class CheckPublish extends Command {
  static description = 'describe the command here'

  static flags = {
    ...cf.commonFlags,

    checkName: flags.string({description: 'check name', required: true}),
    summary: flags.string({description: 'check summary', required: true}),
    title: flags.string({description: 'check title', required: true}),
  }

  requiredVar(value: string | undefined, error: string): string {
    if (value === undefined || value.length === 0) {
      throw new Error(error)
    }
    return value
  }

  async run() {
    const {flags} = this.parse(CheckPublish)
    const appId = flags.appId || process.env.GH_APP_ID
    const privateKey = flags.privateKey || process.env.GH_APP_PRIVATE_KEY
    const installationId = flags.installationId || process.env.GH_APP_INSTALLATION_ID

    await new GithubCheckPublisher().publish({
      checkName: flags.checkName,
      conclusion: flags.checkConclusion ? flags.checkConclusion : 'success',
      summary: flags.summary,
      title: flags.title,
      appId: this.requiredVar(appId, 'appId flag or GH_APP_ID environment variable is required'),
      privateKey: this.requiredVar(privateKey, 'privateKey flag or GH_APP_PRIVATE_KEY environment variable is required'),
      installationId: this.requiredVar(installationId, 'installationId flag or GH_APP_INSTALLATION_ID environment variable is required'),
      commit: flags.commit,
      repoOwner: flags.repoOwner,
      repoName: flags.repoName,
      checkStatus: flags.checkStatus,
      detailsUrl: flags.detailsUrl,
    })
  }
}
