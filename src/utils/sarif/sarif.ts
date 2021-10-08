import * as sarif from './sarif-to-markdown'
import GithubCheckPublisher, {GitHubCheckBasic} from '../github-check-publisher'
import SarifParser from './sarif-parser'

interface SarifCheck extends GitHubCheckBasic {
  checkName: string;
  sourceRoot: string;
}

export class Sarif {
  public async publishAsCheck(param: SarifCheck) {
    const sarifPayload = JSON.parse(new SarifParser().getCombinedSarifReport(param.sourceRoot))
    const sarifToMarkdownResults = sarif.sarifToMarkdown({})(sarifPayload)
    const defaultConclusion = sarifToMarkdownResults[0].hasMessages ? 'action_required' : 'success'
    await new GithubCheckPublisher().publish(
      {
        ...param,
        checkName: param.checkName,
        conclusion: param.checkConclusion ? param.checkConclusion : defaultConclusion,
        title: 'Sarif Report',
        summary: sarifToMarkdownResults[0].body,
      }
    )
  }
}
