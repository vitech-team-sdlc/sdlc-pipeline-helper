// eslint-disable-next-line node/no-missing-import
import {Log, Run} from 'sarif'
// eslint-disable-next-line node/no-extraneous-require
const escape = require('markdown-escape')

export type sarifFormatterOptions = {
  title?: string;
}

type sarifToMarkdownResult = {
  title?: string;
  body: string;
  hasMessages: boolean;
};

function resultsToMarkdownList(run: Run) {
  const joinedSarifResults = run.results?.map(res => {
    return `- **${res.ruleId}**: ${escape(res.message.text)} \n **level:** ${res.level}, **attack vector:** ${res.properties?.cvssv3_attackVector}, **source:** ${res.properties?.source} \n\n`
  }).join('\n')
  return `
## Results (${run.results?.length} issues)

${joinedSarifResults}
  `
}

function emptySarifReport() {
  return `f
## Results

No Error

`
}

function getReportDetails(run: Run) {
  return `<details><summary>Details</summary><pre>${JSON.stringify(run.tool, null, 4)}</pre></details>`
}

export const sarifToMarkdown = (options: sarifFormatterOptions): (sarifLog: Log) => sarifToMarkdownResult[] => {
  return (sarifLog: Log) => {
    return sarifLog.runs.map(run => {
      const title = options.title ? `# ${options.title}\n` : ''
      const ruleDetails = getReportDetails(run)
      const results = run.results && run.results.length > 0 ? resultsToMarkdownList(run) : emptySarifReport()
      return {
        body: title + '\n' + ruleDetails + '\n' + results,
        hasMessages: run.results?.length !== 0,
      }
    })
  }
}
