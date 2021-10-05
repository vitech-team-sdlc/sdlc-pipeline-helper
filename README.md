[SDLC Vitech](https://vitech-team.github.io/SDLC/)
===================

Pipelines Helpers

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@sdlc.vitechteam/sdlc-pipeline-helper.svg)](https://npmjs.org/package/@sdlc.vitechteam/sdlc-pipeline-helper)
[![Downloads/week](https://img.shields.io/npm/dw/@sdlc.vitechteam/sdlc-pipeline-helper.svg)](https://npmjs.org/package/@sdlc.vitechteam/sdlc-pipeline-helper)
[![License](https://img.shields.io/npm/l/sdlc.vitechteam.com.svg)](https://github.com/vitech-team/pipeline-helper/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @sdlc.vitechteam/sdlc-pipeline-helper
$ sdlcpipelinehelper COMMAND
running command...
$ sdlcpipelinehelper (-v|--version|version)
@sdlc.vitechteam/sdlc-pipeline-helper/0.0.1 darwin-x64 node-v14.11.0
$ sdlcpipelinehelper --help [COMMAND]
USAGE
  $ sdlcpipelinehelper COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sdlcpipelinehelper help [COMMAND]`](#sdlcpipelinehelper-help-command)
* [`sdlcpipelinehelper junitpublish`](#sdlcpipelinehelper-junitpublish)

## `sdlcpipelinehelper help [COMMAND]`

display help for sdlcpipelinehelper

```
USAGE
  $ sdlcpipelinehelper help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `sdlcpipelinehelper junitpublish`

describe the command here

```
USAGE
  $ sdlcpipelinehelper junitpublish

OPTIONS
  -f, --reportPaths=reportPaths    (required) report paths like: **/test-results/**/TEST-*.xml
  -h, --help                       show CLI help
  -s, --summary=summary            (required) summary
  --appId=appId                    GitHub application id. Optionally use GH_APP_ID environment variable
  --checkName=checkName            (required) github check name
  --commit=commit                  (required) commit SHA

  --installationId=installationId  GitHub application installationId. Optionally use GH_APP_INSTALLATION_ID environment
                                   variable

  --privateKey=privateKey          GitHub application primate key. Optionally use GH_APP_PRIVATE_KEY environment
                                   variable

EXAMPLE
  $ pipehelper junitpublish --reportPaths="**/test-results/**/TEST-*.xml" --summary="JUnit Report" --checkName="JUnit 
  Report Check" --commit="$PULL_PULL_SHA"
```

_See code: [src/commands/junitpublish.ts](https://github.com/vitech-team/sdlc-pipeline-helper/blob/v0.0.1/src/commands/junitpublish.ts)_
<!-- commandsstop -->
