import * as fs from 'fs'
import * as path from 'path'
import * as jsonschema from 'jsonschema'
import * as logger from '@actions/core'

export default class SarifParser {
  public getCombinedSarifReport(sourceRootPath: string): string {
    const sarifFilePaths = this.getSarifFilePaths(sourceRootPath)
    for (const file of sarifFilePaths) {
      this.validateSarifFileSchema(file)
    }
    return this.combineSarifFiles(sarifFilePaths)
  }

  combineSarifFiles(sarifFiles: string[]): string {
    const combinedSarif = {
      version: null,
      runs: [] as any[],
    }

    for (const sarifFile of sarifFiles) {
      const sarifObject = JSON.parse(fs.readFileSync(sarifFile, 'utf8'))
      // Check SARIF version
      if (combinedSarif.version === null) {
        combinedSarif.version = sarifObject.version
      } else if (combinedSarif.version !== sarifObject.version) {
        throw new Error(
          `Different SARIF versions encountered: ${combinedSarif.version} and ${sarifObject.version}`
        )
      }

      combinedSarif.runs.push(...sarifObject.runs)
    }

    return JSON.stringify(combinedSarif)
  }

  getSarifFilePaths(sarifPath: string) {
    if (!fs.existsSync(sarifPath)) {
      throw new Error(`Path does not exist: ${sarifPath}`)
    }

    let sarifFiles: string[]
    if (fs.lstatSync(sarifPath).isDirectory()) {
      sarifFiles = this.findSarifFilesInDir(sarifPath)
      if (sarifFiles.length === 0) {
        throw new Error(`No SARIF files found to upload in "${sarifPath}".`)
      }
    } else {
      sarifFiles = [sarifPath]
    }
    return sarifFiles
  }

  findSarifFilesInDir(sarifPath: string): string[] {
    const sarifFiles: string[] = []
    const walkSarifFiles = (dir: string) => {
      const entries = fs.readdirSync(dir, {withFileTypes: true})
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.sarif')) {
          sarifFiles.push(path.resolve(dir, entry.name))
        } else if (entry.isDirectory()) {
          walkSarifFiles(path.resolve(dir, entry.name))
        }
      }
    }
    walkSarifFiles(sarifPath)
    return sarifFiles
  }

  validateSarifFileSchema(sarifFilePath: string) {
    const sarif = JSON.parse(fs.readFileSync(sarifFilePath, 'utf8'))
    const schema = require('./sarif_v2.1.0_schema.json')

    const result = new jsonschema.Validator().validate(sarif, schema)
    if (!result.valid) {
      // Output the more verbose error messages in groups as these may be very large.
      for (const error of result.errors) {
        logger.startGroup(`Error details: ${error.stack}`)
        logger.info(JSON.stringify(error, null, 2))
        logger.endGroup()
      }

      // Set the main error message to the stacks of all the errors.
      // This should be of a manageable size and may even give enough to fix the error.
      const sarifErrors = result.errors.map(e => `- ${e.stack}`)
      throw new Error(
        `Unable to upload "${sarifFilePath}" as it is not valid SARIF:\n${sarifErrors.join(
          '\n'
        )}`
      )
    }
  }
}
