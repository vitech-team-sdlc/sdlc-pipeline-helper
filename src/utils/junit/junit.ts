import * as core from '@actions/core'
import * as github from '@actions/github'
import {parseTestReports} from './test-parser'
import GithubCheckPublisher, {GitHubCheckBasic} from '../github-check-publisher'

interface JUnitCheck extends GitHubCheckBasic {
  reportPaths: string;
  checkName?: string;
}

export class Junit {
  public async publish(param: JUnitCheck): Promise<void> {
    try {
      core.startGroup('📘 Reading input values')

      const suiteRegex = core.getInput('suite_regex')
      const failOnFailure = core.getInput('fail_on_failure') === 'true'
      const requireTests = core.getInput('require_tests') === 'true'

      core.endGroup()
      core.startGroup('📦 Process test results')

      const testResult = await parseTestReports(param.reportPaths, suiteRegex)
      const foundResults = testResult.count > 0 || testResult.skipped > 0
      const title = foundResults ?
        `${testResult.count} tests run, ${testResult.skipped} skipped, ${testResult.annotations.length} failed.` :
        'No test results found!'
      core.info(`ℹ️ ${title}`)

      if (!foundResults) {
        if (requireTests) {
          core.setFailed('❌ No test results found')
        }
        return
      }

      const pullRequest = github.context.payload.pull_request
      const link = (pullRequest && pullRequest.html_url) || github.context.ref
      const conclusion: 'success' | 'failure' = foundResults && testResult.annotations.length === 0 ? 'success' : 'failure'
      const status: 'completed' = 'completed'
      const head_sha = param.commit || (pullRequest && pullRequest.head.sha) || github.context.sha

      core.info(`ℹ️ Posting status '${status}' with conclusion '${conclusion}' to ${link} (sha: ${head_sha})`)
      core.endGroup()

      core.startGroup('🚀 Publish results')
      try {
        await new GithubCheckPublisher().publish({
          ...param,
          title: title,
          annotations: testResult.annotations.slice(0, 50),
          checkName: param.checkName ? param.checkName : 'JUnit',
          conclusion: param.checkConclusion ? param.checkConclusion : conclusion,
          summary: '',
        })

        if (failOnFailure && conclusion === 'failure') {
          core.setFailed(`❌ Tests reported ${testResult.annotations.length} failures`)
        }
      } catch (error) {
        core.error(`❌ Failed to create checks using the provided token. (${error})`)
      }

      core.endGroup()
    } catch (error: any) {
      core.setFailed(error.message)
    }
  }
}
