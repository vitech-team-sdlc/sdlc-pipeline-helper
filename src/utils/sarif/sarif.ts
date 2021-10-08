import * as sarif from './sarif-to-markdown'
import GithubCheckPublisher, {GitHubCheckBasic} from '../github-check-publisher'
import SarifParser from './sarif-parser'
// eslint-disable-next-line node/no-missing-import
import {Log} from 'sarif'

interface SarifCheck extends GitHubCheckBasic {
  checkName: string;
  sourceRoot: string;
}

export class Sarif {
  public async publishAsCheck(param: SarifCheck) {
    const sarifPayload: Log = JSON.parse(new SarifParser().getCombinedSarifReport(param.sourceRoot))
    const sarifToMarkdownResults = sarif.sarifToMarkdown({})(sarifPayload)
    const defaultConclusion = sarifToMarkdownResults[0].hasMessages ? 'action_required' : 'success'
    await new GithubCheckPublisher().publish(
      {
        ...param,
        checkName: param.checkName,
        conclusion: param.checkConclusion ? param.checkConclusion : defaultConclusion,
        title: `Sarif: ${sarifPayload.runs[0]?.results?.length} issues found`,
        summary: sarifToMarkdownResults[0].body,
      }
    )
  }
}
