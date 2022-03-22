import {flags} from '@oclif/command'

export const commonFlags = {

  help: flags.help({char: 'h'}),

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
  repoOwner: flags.string(
    {
      description: 'Git repository owner',
      required: true,
    },
  ),
  repoName: flags.string(
    {
      description: 'Git repository name',
      required: true,
    },
  ),
  commit: flags.string(
    {
      description: 'commit SHA',
      required: true,
    },
  ),
  detailsUrl: flags.string(
    {
      description: 'Details URL about build. In our case link to Tekton dashboard.',
    },
  ),
  checkStatus: flags.string(
    {
      description: 'check status: queued, in_progress, or completed',
      default: 'completed',
    },
  ),
  checkConclusion: flags.string(
    {
      description: `Can be one of action_required, cancelled, failure, neutral, success, skipped, stale, or timed_out.
      When the conclusion is action_required, additional details should be provided on the site specified by details_url.`,
    },
  ),
}

export function requiredVar(value: string | undefined, error: string): string {
  if (value === undefined || value.length === 0) {
    throw new Error(error)
  }
  return value
}

export function getGhAppProps(flags: any): GhAppProps {
  const appId = flags.appId || process.env.GH_APP_ID
  const privateKey = flags.privateKey || process.env.GH_APP_PRIVATE_KEY
  const installationId = flags.installationId || process.env.GH_APP_INSTALLATION_ID
  return {
    appId: requiredVar(appId, 'appId flag or GH_APP_ID environment variable is required'),
    privateKey: requiredVar(privateKey, 'privateKey flag or GH_APP_PRIVATE_KEY environment variable is required'),
    installationId: requiredVar(installationId, 'installationId flag or GH_APP_INSTALLATION_ID environment variable is required'),
  }
}

export interface GhAppProps {
  appId: string;
  privateKey: string;
  installationId: string;
}
