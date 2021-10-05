import {Command, flags} from '@oclif/command'

import * as core from '@actions/core'
import * as github from '@actions/github'
import {parseTestReports} from '../utils/testParser'
import {Octokit} from 'octokit'
import {createAppAuth} from '@octokit/auth-app'
import cli from 'cli-ux'

export default class JunitReportPublisher extends Command {
  static description = 'describe the command here'

  static examples = [
    '$ pipehelper junitpublish --reportPaths="**/test-results/**/TEST-*.xml" --summary="JUnit Report" --checkName="JUnit Report Check" --commit="$PULL_PULL_SHA"',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    summary: flags.string(
      {
        char: 's',
        description: 'summary',
        required: true,
      },
    ),
    checkName: flags.string({
      description: 'github check name',
      required: true,
    }),
    reportPaths: flags.string(
      {
        char: 'f',
        description: 'report paths like: **/test-results/**/TEST-*.xml ',
        required: true,
      },
    ),
    commit: flags.string(
      {
        description: 'commit SHA',
        required: true,
      },
    ),
    appId: flags.string(
      {
        description: 'GitHub application id. Optionally use GH_APP_ID environment variable',
      },
    ),
    privateKey: flags.string(
      {
        description: 'GitHub application primate key. Optionally use GH_APP_PRIVATE_KEY environment variable',
      },
    ),
    installationId: flags.string(
      {
        description: 'GitHub application installationId. Optionally use GH_APP_INSTALLATION_ID environment variable',
      },
    ),
  }

  static args = []

  async publish(
    summary: string,
    checkName: string,
    reportPaths: string,
    commit: string,
    appId: string,
    privateKey: string,
    installationId: string,
  ): Promise<void> {
    try {
      core.startGroup('📘 Reading input values')

      const suiteRegex = core.getInput('suite_regex')
      const failOnFailure = core.getInput('fail_on_failure') === 'true'
      const requireTests = core.getInput('require_tests') === 'true'

      core.endGroup()
      core.startGroup('📦 Process test results')

      const testResult = await parseTestReports(reportPaths, suiteRegex)
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
      const conclusion: 'success' | 'failure' =
        foundResults && testResult.annotations.length === 0 ?
          'success' :
          'failure'
      const status: 'completed' = 'completed'
      const head_sha =
        commit || (pullRequest && pullRequest.head.sha) || github.context.sha
      core.info(
        `ℹ️ Posting status '${status}' with conclusion '${conclusion}' to ${link} (sha: ${head_sha})`,
      )

      const createCheckRequest = {
        ...github.context.repo,
        name: checkName,
        head_sha,
        status,
        conclusion,
        output: {
          title,
          summary,
          annotations: testResult.annotations.slice(0, 50),
        },
      }

      core.debug(JSON.stringify(createCheckRequest, null, 2))
      core.endGroup()

      core.startGroup('🚀 Publish results')

      try {
        const octokit = new Octokit({
          authStrategy: createAppAuth,
          auth: {
            appId: appId,
            privateKey: privateKey,
            installationId: installationId,
          },
        })

        // octokit.request('PUT /repos/:owner/:repo/code-scanning/analysis/status', {
        //   owner: 'owner',
        //   repo: 'repo',
        //   data: {},
        // })

        await octokit.rest.checks.create(createCheckRequest)

        if (failOnFailure && conclusion === 'failure') {
          core.setFailed(
            `❌ Tests reported ${testResult.annotations.length} failures`,
          )
        }
      } catch (error) {
        core.error(
          `❌ Failed to create checks using the provided token. (${error})`,
        )
        core.warning(
          '⚠️ This usually indicates insufficient permissions. More details: https://github.com/mikepenz/action-junit-report/issues/23',
        )
      }

      core.endGroup()
    } catch (error: any) {
      core.setFailed(error.message)
    }
  }

  requiredVar(value: string | undefined, error: string): string {
    if (value === undefined || value.length === 0) {
      throw new Error(error)
    }
    return value
  }

  async run() {
    const {flags} = this.parse(JunitReportPublisher)

    cli.action.start('publishing junit report to GitHub')

    const appId = flags.appId || process.env.GH_APP_ID
    const privateKey = flags.privateKey || process.env.GH_APP_PRIVATE_KEY
    const installationId = flags.installationId || process.env.GH_APP_INSTALLATION_ID

    await this.publish(
      flags.summary,
      flags.checkName,
      flags.reportPaths,
      flags.commit,
      this.requiredVar(appId, 'appId flag or GH_APP_ID environment variable is required'),
      this.requiredVar(privateKey, 'privateKey flag or GH_APP_PRIVATE_KEY environment variable is required'),
      this.requiredVar(installationId, 'installationId flag or GH_APP_INSTALLATION_ID environment variable is required'),
    )
    cli.action.stop('Junit report published')
  }
}

