function getStepByStatus(scenario: any, status: any) {
  const before = scenario.before || []
  const after = scenario.after || []
  const steps = scenario.steps || []

  return before.concat(after, steps).filter((step: any) => step.result.status === status)
}

function getFailedSteps(scenario: any) {
  return getStepByStatus(scenario, 'failed')
}

function getSkippedSteps(scenario: any) {
  return getStepByStatus(scenario, 'skipped')
}

function getUndefinedSteps(scenario: any) {
  return getStepByStatus(scenario, 'undefined')
}

function getPendingSteps(scenario: any) {
  return getStepByStatus(scenario, 'pending')
}

function hasFailed(scenario: any) {
  return getFailedSteps(scenario).length > 0
}

function hasUndefined(scenario: any) {
  return getUndefinedSteps(scenario).length > 0
}

function hasPending(scenario: any) {
  return getPendingSteps(scenario).length > 0
}

function buildStepData(fileReport: any, scenario: any, getStepsFunction: any) {
  const skippedStep = getStepsFunction(scenario)[0]
  return {
    file: fileReport.uri,
    line: skippedStep.line,
    title: scenario.name,
    step: skippedStep.name,
    error: skippedStep.result.error_message,
  }
}

function buildFailData(fileReport: any, scenario: any) {
  return buildStepData(fileReport, scenario, getFailedSteps)
}

function buildUndefinedData(fileReport: any, scenario: any) {
  return buildStepData(fileReport, scenario, getUndefinedSteps)
}

function buildPendingData(fileReport: any, scenario: any) {
  return buildStepData(fileReport, scenario, getPendingSteps)
}

function fileFailureStepData(fileReport: any) {
  return fileReport.elements
  .filter((scenario: any) => hasFailed(scenario))
  .map((failedScenario: any) => buildFailData(fileReport, failedScenario))
}

function fileUndefinedStepsData(fileReport: any) {
  return fileReport.elements
  .filter((scenario: any) => hasUndefined(scenario))
  .map((undefinedScenario: any) => buildUndefinedData(fileReport, undefinedScenario))
}

function filePendingStepsData(fileReport: any) {
  return fileReport.elements
  .filter((scenario: any) => hasPending(scenario))
  .map((pendingScenario: any) => buildPendingData(fileReport, pendingScenario))
}

function sum(info1: CucumberReport, info2: CucumberReport) {
  return {
    scenarioNumber: info1.scenarioNumber + info2.scenarioNumber,
    failedScenarioNumber: info1.failedScenarioNumber + info2.failedScenarioNumber,
    pendingScenarioNumber: info1.pendingScenarioNumber + info2.pendingScenarioNumber,
    undefinedScenarioNumber: info1.undefinedScenarioNumber + info2.undefinedScenarioNumber,
    stepsNumber: info1.stepsNumber + info2.stepsNumber,
    succeedScenarioNumber: info1.succeedScenarioNumber + info2.succeedScenarioNumber,
    failedStepsNumber: info1.failedStepsNumber + info2.failedStepsNumber,
    skippedStepsNumber: info1.skippedStepsNumber + info2.skippedStepsNumber,
    undefinedStepsNumber: info1.undefinedStepsNumber + info2.undefinedStepsNumber,
    succeedStepsNumber: info1.succeedStepsNumber + info2.succeedStepsNumber,
    pendingStepNumber: info1.pendingStepNumber + info2.pendingStepNumber,
  }
}

function globalFileInformation(reportFile: any): CucumberReport {
  const scenario = reportFile.elements.filter((element: any) => element.type === 'scenario')

  const failedScenarioNumber: number = scenario.filter((scenario: any) => hasFailed(scenario)).length
  const undefinedScenarioNumber: number = scenario.filter((scenario: any) => hasUndefined(scenario)).length
  const pendingScenarioNumber: number = scenario.filter((scenario: any) => hasPending(scenario)).length
  const stepsNumber: number = reportFile.elements.map((scenario: { steps: string | any[] }) => scenario.steps.length).reduce((a: number, b: number) => a + b, 0)
  const failedStepsNumber: number = reportFile.elements.map((scenario: any) => getFailedSteps(scenario).length).reduce((a: number, b: number) => a + b, 0)

  const skippedStepsNumber: number = reportFile.elements.map((scenario: any) => getSkippedSteps(scenario).length).reduce((a: number, b: number) => a + b, 0)
  const undefinedStepsNumber: number = reportFile.elements.map((scenario: any) => getUndefinedSteps(scenario).length).reduce((a: number, b: number) => a + b, 0)
  const pendingStepNumber: number = reportFile.elements.map((scenario: any) => getPendingSteps(scenario).length).reduce((a: number, b: number) => a + b, 0)

  return {
    scenarioNumber: scenario.length,
    failedScenarioNumber: failedScenarioNumber,
    undefinedScenarioNumber: undefinedScenarioNumber,
    pendingScenarioNumber: pendingScenarioNumber,
    succeedScenarioNumber: scenario.length - failedScenarioNumber - undefinedScenarioNumber - pendingScenarioNumber,
    stepsNumber: stepsNumber,
    failedStepsNumber: failedStepsNumber,
    skippedStepsNumber: skippedStepsNumber,
    undefinedStepsNumber: undefinedStepsNumber,
    pendingStepNumber: pendingStepNumber,
    succeedStepsNumber: stepsNumber - failedStepsNumber - skippedStepsNumber - undefinedStepsNumber - pendingStepNumber,
  }
}

export interface CucumberReport {
  succeedScenarioNumber: number;
  pendingScenarioNumber: number;
  stepsNumber: number;
  succeedStepsNumber: number;
  undefinedScenarioNumber: number;
  failedScenarioNumber: number;
  pendingStepNumber: number;
  skippedStepsNumber: number;
  failedStepsNumber: number;
  undefinedStepsNumber: number;
  scenarioNumber: number;
}

export function globalInformation(report: any) {
  return report
  .map((fileReport: any) => globalFileInformation(fileReport))
  .reduce((a: CucumberReport, b: CucumberReport) => sum(a, b))
}

export function failedSteps(report: any) {
  return report
  .map((fileReport: any) => {
    return fileFailureStepData(fileReport)
  })
  .reduce((a: any, b: any) => a.concat(b), [])
}

export function undefinedSteps(report: any) {
  return report
  .map((fileReport: any) => fileUndefinedStepsData(fileReport))
  .reduce((a: any, b: any) => a.concat(b), [])
}

export function pendingSteps(report: any) {
  return report
  .map((fileReport: any) => filePendingStepsData(fileReport))
  .reduce((a: any, b: any) => a.concat(b), [])
}
