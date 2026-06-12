export const LESSONS = [
  {
    id: 1,
    slug: '01-hello-world',
    title: 'Hello World',
    subtitle: 'Your first workflow',
    workflowFile: '01-hello-world.yml',
    concepts: ['workflow structure', 'jobs', 'steps', 'run commands'],
    description: 'Learn the anatomy of a GitHub Actions workflow. Every workflow has triggers, jobs, and steps. This is the foundation everything else builds on.',
    keyPoints: [
      'A workflow is a YAML file in .github/workflows/',
      'The "on:" key defines what triggers the workflow',
      'Jobs run in parallel by default',
      'Steps run sequentially within a job',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> J["Job: say-hello"]
      J --> S1["Step: Print greeting"]
      S1 --> S2["Step: Show runner info"]
      S2 --> S3["Step: Multi-line script"]`,
  },
  {
    id: 2,
    slug: '02-triggers',
    title: 'Triggers',
    subtitle: 'When does your workflow run?',
    workflowFile: '02-triggers.yml',
    concepts: ['workflow_dispatch', 'push', 'schedule', 'inputs', 'pull_request'],
    description: 'Workflows can be triggered by Git events (push, PR), schedules (cron), or manually. Each trigger can filter by branch, path, or user-defined inputs.',
    keyPoints: [
      'workflow_dispatch enables manual + input-driven runs',
      'push triggers can filter by branch and file path',
      'schedule uses cron syntax (UTC timezone)',
      'Multiple triggers on one workflow are allowed',
    ],
    mermaidGraph: `graph TD
      T1["on: workflow_dispatch"] --> J
      T2["on: push (main)"] --> J
      T3["on: schedule (Mon 9am)"] --> J
      J["Job: show-trigger"] --> S1["Step: What triggered?"]
      S1 --> S2["Step: Handle dispatch"]
      S1 --> S3["Step: Handle push"]
      S1 --> S4["Step: Handle schedule"]`,
  },
  {
    id: 3,
    slug: '03-jobs-steps',
    title: 'Jobs & Steps',
    subtitle: 'Parallelism and dependencies',
    workflowFile: '03-jobs-steps.yml',
    concepts: ['jobs', 'needs', 'outputs', 'parallel jobs', 'step outputs'],
    description: 'Jobs are isolated units of work. They run in parallel unless you declare dependencies with "needs:". Step outputs let you pass data between steps and jobs.',
    keyPoints: [
      'Jobs run in parallel — great for speed',
      '"needs:" creates a dependency chain',
      '"outputs:" lets jobs share data',
      'Steps within a job are always sequential',
    ],
    mermaidGraph: `graph TD
      B["Job: build"] --> T["Job: test (needs: build)"]
      L["Job: lint"] --> D["Job: deploy (needs: build+test+lint)"]
      B --> D
      T --> D`,
  },
  {
    id: 4,
    slug: '04-context-vars',
    title: 'Context & Variables',
    subtitle: 'Dynamic data in your workflows',
    workflowFile: '04-context-vars.yml',
    concepts: ['github context', 'runner context', 'env', 'GITHUB_ENV', 'expressions'],
    description: 'GitHub provides rich context objects (github.*, runner.*, steps.*) accessible via the ${{ }} expression syntax. Environment variables can be scoped globally, per-job, or per-step.',
    keyPoints: [
      '${{ github.actor }} — who triggered the run',
      '${{ github.ref }} — which branch/tag',
      'GITHUB_ENV — persist values between steps',
      'env: at workflow/job/step level for scoping',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> J["Job: explore-context"]
      J --> S1["Step: GitHub context"]
      S1 --> S2["Step: Runner context"]
      S2 --> S3["Step: Environment variables"]
      S3 --> S4["Step: Write to GITHUB_ENV"]
      S4 --> S5["Step: Read persisted env"]`,
  },
  {
    id: 5,
    slug: '05-using-actions',
    title: 'Using Actions',
    subtitle: 'Reusable building blocks',
    workflowFile: '05-using-actions.yml',
    concepts: ['uses', 'actions/checkout', 'actions/setup-node', 'version pinning', 'docker actions'],
    description: 'Actions are pre-built, reusable units you compose into your workflow with "uses:". The GitHub Marketplace has thousands — from checkout to cloud deployments.',
    keyPoints: [
      '"uses: actions/checkout@v4" — always pin a version',
      'with: passes inputs to the action',
      'Action outputs are available as step outputs',
      'Docker actions run containers as a step',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> J1["Job: use-community-actions"]
      T --> J2["Job: use-docker-action"]
      J1 --> A1["uses: actions/checkout@v4"]
      A1 --> A2["uses: actions/setup-node@v4"]
      A2 --> A3["uses: setup-python@v5"]
      A3 --> A4["uses: current-date-time@v1"]
      J2 --> D1["uses: docker://alpine:3.19"]`,
  },
  {
    id: 6,
    slug: '06-conditionals',
    title: 'Conditionals',
    subtitle: 'Control flow and error handling',
    workflowFile: '06-conditionals.yml',
    concepts: ['if', 'success()', 'failure()', 'always()', 'continue-on-error', 'needs'],
    description: 'Use "if:" to conditionally run jobs or steps. Status functions like success(), failure(), and always() control post-job flow — perfect for notifications and cleanup.',
    keyPoints: [
      '"if: success()" — default; runs if all deps succeeded',
      '"if: failure()" — runs cleanup when something broke',
      '"if: always()" — always runs regardless of status',
      '"continue-on-error: true" — step failure doesn\'t fail the job',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> P["Job: prepare"]
      P -->|success| S["Job: on-success"]
      P -->|failure| F["Job: on-failure"]
      S --> A["Job: always-run"]
      F --> A`,
  },
  {
    id: 7,
    slug: '07-matrix',
    title: 'Matrix Builds',
    subtitle: 'Test across multiple configurations',
    workflowFile: '07-matrix.yml',
    concepts: ['strategy.matrix', 'fail-fast', 'max-parallel', 'include', 'exclude'],
    description: 'Matrix builds run the same job across multiple combinations of values — different Node versions, OSes, or any custom variables. GitHub fans them out in parallel automatically.',
    keyPoints: [
      'matrix: creates a cartesian product of all combinations',
      'fail-fast: false — all combinations run even if one fails',
      'max-parallel: limits concurrency',
      'include/exclude: fine-tune which combinations run',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> M["strategy.matrix"]
      M --> N18U["Node 18 / Ubuntu"]
      M --> N18W["Node 18 / Windows"]
      M --> N20U["Node 20 / Ubuntu"]
      M --> N20W["Node 20 / Windows"]
      M --> N22U["Node 22 / Ubuntu"]
      M --> N22W["Node 22 / Windows"]`,
  },
  {
    id: 8,
    slug: '08-secrets',
    title: 'Secrets & Security',
    subtitle: 'Keeping credentials safe',
    workflowFile: '08-secrets.yml',
    concepts: ['secrets', 'GITHUB_TOKEN', 'OIDC', 'permissions', 'masked output'],
    description: 'GitHub encrypts secrets at rest and masks them in logs. GITHUB_TOKEN is automatically injected — no PAT storage needed for most GitHub API calls.',
    keyPoints: [
      'secrets.GITHUB_TOKEN is always available — free API access',
      'Secret values are masked (shown as ***) in logs',
      'OIDC tokens enable passwordless cloud auth',
      '"permissions:" scopes what GITHUB_TOKEN can do',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> J1["Job: use-secrets"]
      T --> J2["Job: oidc-example"]
      J1 --> S1["Step: Use secret safely"]
      S1 --> S2["Step: Secrets are masked"]
      S2 --> S3["Step: GITHUB_TOKEN"]
      S3 --> S4["Step: Call GitHub API"]
      J2 --> O1["Step: OIDC token"]`,
  },
  {
    id: 9,
    slug: '09-artifacts-cache',
    title: 'Artifacts & Cache',
    subtitle: 'Sharing data between jobs',
    workflowFile: '09-artifacts-cache.yml',
    concepts: ['upload-artifact', 'download-artifact', 'cache', 'hashFiles', 'retention-days'],
    description: 'Artifacts persist build outputs across jobs and workflow runs. Cache stores expensive downloads (npm, pip, maven) so subsequent runs skip re-downloading.',
    keyPoints: [
      'Artifacts: share files between jobs in a workflow',
      'Artifacts persist for retention-days (default 90)',
      'Cache key = unique string (often includes file hash)',
      'Cache miss → run steps; cache hit → skip them',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch"] --> J1["Job: build-and-upload"]
      T --> J3["Job: cached-dependencies"]
      J1 -->|artifact| J2["Job: download-and-use"]
      J1 --> U["upload-artifact@v4"]
      J2 --> D["download-artifact@v4"]
      J3 --> C["cache@v4"]`,
  },
  {
    id: 10,
    slug: '10-reusable',
    title: 'Reusable Workflows',
    subtitle: 'Compose workflows like functions',
    workflowFile: '10-reusable.yml',
    concepts: ['workflow_call', 'inputs', 'outputs', 'secrets inheritance', 'GITHUB_STEP_SUMMARY'],
    description: 'Reusable workflows let you define a workflow once and call it from multiple other workflows — like a function call. They accept typed inputs, return outputs, and can inherit secrets.',
    keyPoints: [
      '"on: workflow_call" makes a workflow reusable',
      'inputs: and secrets: declare the interface',
      'outputs: return values to the caller',
      'GITHUB_STEP_SUMMARY writes a rich job summary',
    ],
    mermaidGraph: `graph TD
      T["on: workflow_dispatch / workflow_call"] --> V["Job: validate"]
      V --> D["Job: deploy"]
      D --> N["Job: notify"]
      D --> O["outputs: deployment_id"]
      N --> S["GITHUB_STEP_SUMMARY"]`,
  },
]

export function getLessonById(id) {
  return LESSONS.find((l) => l.id === id)
}
