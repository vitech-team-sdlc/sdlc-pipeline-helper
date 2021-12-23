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
    const propsDesc = res.properties ? `\n<details><summary>CVE Details</summary><pre>${JSON.stringify(res.properties, null, 4)}</pre></details>` : ''
    return `- **${res.ruleId}**: ${escape(res.message.text)} \n **level:** ${res.level}, **attack vector:** ${res.properties?.cvssv3_attackVector}, **source:** ${res.properties?.source} ${propsDesc}\n\n`
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

function getRulesInfo(run: Run) {
  const rules = run.tool.driver?.rules?.map(rule => `**${rule.id}** - ${rule.help?.text} \n > ${rule.shortDescription?.text} \n`).join('\n')
  return `\n## Rules\n${rules}\n`
}

export const sarifToMarkdown = (options: sarifFormatterOptions): (sarifLog: Log) => sarifToMarkdownResult[] => {
  return (sarifLog: Log) => {
    return sarifLog.runs.map(run => {
      const title = options.title ? `# ${options.title}\n` : ''
      const ruleDetails = getReportDetails(run)
      const results = run.results && run.results.length > 0 ? resultsToMarkdownList(run) : emptySarifReport()
      const ruleInfo = run?.tool?.driver?.rules && run?.tool?.driver?.rules?.length ? getRulesInfo(run) : ''
      return {
        body: title + '\n' + ruleInfo + '\n' + ruleDetails + '\n' + results,
        hasMessages: run.results?.length !== 0,
      }
    })
  }
}
