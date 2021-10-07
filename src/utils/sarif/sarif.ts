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
    await new GithubCheckPublisher().publish(
      {
        ...param,
        checkName: param.checkName,
        conclusion: sarifToMarkdownResults[0].hasMessages ? 'action_required' : 'success',
        title: 'Sarif Report',
        summary: sarifToMarkdownResults[0].body,
      }
    )
  }
}
