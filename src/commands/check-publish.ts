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

  async run() {
    const {flags} = this.parse(CheckPublish)
    const ghAppVars = cf.getGhAppProps(flags)
    await new GithubCheckPublisher().publish({
      ...ghAppVars,
      checkName: flags.checkName,
      conclusion: flags.checkConclusion ? flags.checkConclusion : 'success',
      summary: flags.summary,
      title: flags.title,
      commit: flags.commit,
      repoOwner: flags.repoOwner,
      repoName: flags.repoName,
      checkStatus: flags.checkStatus,
      detailsUrl: flags.detailsUrl,
    })
  }
}
