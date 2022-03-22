import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as glob from '@actions/glob'
import GithubCheckPublisher, {GitHubCheck, GitHubCheckBasic} from '../github-check-publisher'
import reportReader = require('./report-reader');

interface CucumberCheck extends GitHubCheckBasic {
  reportPath: string;
  checkName?: string;
  checkStatusOnError?: string;
  checkStatusOnUndefined?: string;
  checkStatusOnPending?: string;
  annotationStatusOnError?: string;
  annotationStatusOnUndefined?: string;
  annotationStatusOnPending?: string;
  showNumberOfErrorOnCheckTitle?: string;
}

export class Cucumber {
  public async publishAsCheck(param: CucumberCheck): Promise<void> {
    const inputPath: string = param.reportPath
    const checkName: string = param.checkName ? param.checkName : 'Cucumber report'
    const checkStatusOnError: string = param.checkStatusOnError ? param.checkStatusOnError : 'failure'
    const checkStatusOnUndefined: string = param.checkStatusOnUndefined ? param.checkStatusOnUndefined : 'success'
    const checkStatusOnPending: string = param.checkStatusOnPending ? param.checkStatusOnPending : 'success'
    const annotationStatusOnError: string = param.annotationStatusOnError ? param.annotationStatusOnError : 'failure'
    const annotationStatusOnUndefined = param.annotationStatusOnUndefined
    const annotationStatusOnPending = param.annotationStatusOnPending
    const showNumberOfErrorOnCheckTitle = param.showNumberOfErrorOnCheckTitle

    const globber = await glob.create(inputPath, {
      followSymbolicLinks: false,
    })

    core.info('start to read cucumber logs using path ' + inputPath)

    for await (const cucumberReportFile of globber.globGenerator()) {
      core.info('found cucumber report ' + cucumberReportFile)

      const reportResult = JSON.parse(fs.readFileSync(cucumberReportFile, 'utf8'))
      const globalInformation = reportReader.globalInformation(reportResult)
      const summaryScenario = {
        failed: globalInformation.failedScenarioNumber,
        undefined: globalInformation.undefinedScenarioNumber,
        pending: globalInformation.pendingScenarioNumber,
        passed: globalInformation.succeedScenarioNumber,
      }
      const summarySteps = {
        failed: globalInformation.failedStepsNumber,
        undefined: globalInformation.undefinedStepsNumber,
        skipped: globalInformation.skippedStepsNumber,
        pending: globalInformation.pendingStepNumber,
        passed: globalInformation.succeedStepsNumber,
      }
      const summary =
        this.buildSummary(globalInformation.scenarioNumber, 'Scenarios', summaryScenario) +
        '\n' +
        this.buildSummary(globalInformation.stepsNumber, 'Steps', summarySteps)

      const errors = reportReader.failedSteps(reportResult)
      let errorAnnotations = await Promise.all(errors.map((e: any) => this.buildErrorAnnotations(e, annotationStatusOnError)))

      if (annotationStatusOnUndefined) {
        const undefinedSteps = reportReader.undefinedSteps(reportResult)
        const undefinedAnnotations = await Promise.all(undefinedSteps.map((e: any) => this.buildUndefinedAnnotation(e, annotationStatusOnUndefined)))
        errorAnnotations.push(...undefinedAnnotations)
      }
      if (annotationStatusOnPending) {
        const pending = reportReader.pendingSteps(reportResult)
        const pendingAnnotations = await Promise.all(pending.map((e: any) => this.buildPendingAnnotation(e, annotationStatusOnPending)))
        errorAnnotations.push(...pendingAnnotations)
      }

      // TODO make an update request if there are more than 50 annotations
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      errorAnnotations = errorAnnotations.slice(0, 49)
      const annotations = [
        {
          path: 'test',
          start_line: 0,
          end_line: 0,
          start_column: 0,
          end_column: 0,
          annotation_level: 'notice',
          title: 'Cucumber report summary',
          message: summary,
        },
        ...errorAnnotations,
      ]

      let additionnalTitleInfo = ''
      // eslint-disable-next-line eqeqeq
      if (showNumberOfErrorOnCheckTitle == 'true' && globalInformation.failedScenarioNumber > 0) {
        additionnalTitleInfo = ` (${globalInformation.failedScenarioNumber} error${globalInformation.failedScenarioNumber > 1 ? 's' : ''})`
      }
      let checkStatus = ''
      if (globalInformation.failedScenarioNumber > 0 && checkStatusOnError !== 'success') {
        checkStatus = checkStatusOnError
      } else if (globalInformation.undefinedStepsNumber > 0 && checkStatusOnUndefined !== 'success') {
        checkStatus = checkStatusOnUndefined
      } else if (globalInformation.pendingStepNumber > 0) {
        checkStatus = checkStatusOnPending
      } else {
        checkStatus = 'success'
      }

      core.info(summary)

      core.info('send global cucumber report data')
      const check: GitHubCheck = {
        conclusion: checkStatus,
        ...param,
        annotations: annotations,
        checkName: checkName,
        checkStatus: 'completed',
        summary: summary,
        title: checkName + additionnalTitleInfo,

      }
      await new GithubCheckPublisher().publish(check)
    }
  }

  memoize(fn: any): any {
    const cache = {}
    // @ts-ignore
    return (...args) => {
      const argsString = JSON.stringify(args)
      // @ts-ignore
      return argsString in cache ?
        // @ts-ignore
        cache[argsString] :
        // @ts-ignore
        (cache[argsString] = fn(...args))
    }
  }

  async findBestFileMatch(file: string): Promise<string> {
    let searchFile = file
    if (searchFile.startsWith('classpath:')) {
      searchFile = searchFile.substring(10)
    }
    const globber = await glob.create('**/' + searchFile, {
      followSymbolicLinks: false,
    })
    const files = await globber.glob()
    if (files.length > 0) {
      const featureFile = files[0]
      const repoName = github.context.repo.repo
      const indexOfRepoName = featureFile.indexOf(repoName)
      return featureFile.substring(indexOfRepoName + repoName.length + 1)
    }

    return ''
  }

  memoizedFindBestFileMatch = this.memoize(this.findBestFileMatch)

  async buildStepAnnotation(cucumberError: any, status: any, errorType: any) {
    const fileMatch = await this.memoizedFindBestFileMatch(cucumberError.file)
    return {
      path: fileMatch || cucumberError.file,
      start_line: cucumberError.line,
      end_line: cucumberError.line,
      start_column: 0,
      end_column: 0,
      annotation_level: status,
      title: cucumberError.title + ' ' + errorType + '.',
      message: 'Scenario: ' + cucumberError.title + '\nStep: ' + cucumberError.step + '\nError: \n' + cucumberError.error,
    }
  }

  async buildErrorAnnotations(cucumberError: any, statusOnError: any) {
    return this.buildStepAnnotation(cucumberError, statusOnError, 'Failed')
  }

  async buildUndefinedAnnotation(cucumberError: any, statusOnSkipped: any) {
    return this.buildStepAnnotation(cucumberError, statusOnSkipped, 'Undefined')
  }

  async buildPendingAnnotation(cucumberError: any, statusOnPending: any) {
    return this.buildStepAnnotation(cucumberError, statusOnPending, 'Pending')
  }

  buildSummary(itemNumber: any, itemType: any, itemCounts: any): string {
    const header = itemNumber + ' ' + itemType
    const counts = Object.keys(itemCounts)
    .filter(key => itemCounts[key] > 0)
    .map(key => itemCounts[key] + ' ' + key)
    .join(', ')
    return `    ${header} (${counts})`
  }
}
