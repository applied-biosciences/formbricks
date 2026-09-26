# CALM Surveys self-hosting

This fork presents the user-facing service as **CALM Surveys by Applied Biosciences**. It retains the
upstream Formbricks licence notices, packages, copyright and Enterprise controls. No licence validation,
feature gate or attribution required by the upstream project has been removed or bypassed.

## Local development

The checked-in `.env.example` remains localhost-only. Copy it to `.env`, provide locally generated secrets,
then run `pnpm go`. The application is available at `http://localhost:3000` and stores its development data
in the Docker Compose PostgreSQL volume. `docker compose -f docker-compose.dev.yml down` preserves that
volume; do not add `-v` when verifying persistence.

## AWS-ready configuration (not deployed)

`deploy/aws/calm-surveys.env.example` is an ECS runtime template for `https://surveys.calmos.io`. It does
not create AWS resources or change Cloudflare DNS. Inject the secret values from AWS Secrets Manager and
use an ECS task role for S3 rather than static credentials.

Recommended topology:

```text
Cloudflare (Full/strict) -> ACM-enabled ALB -> ECS service -> CALM Surveys container
                                             |-> RDS PostgreSQL (private, encrypted, backups)
                                             |-> ElastiCache Valkey (private)
                                             |-> S3 (private, encrypted, block-public-access)
```

Keep RDS and ElastiCache in private subnets and restrict inbound security-group rules to the ECS tasks.
Use a dedicated, environment-specific S3 bucket, versioning and lifecycle policies appropriate to the
retention policy. Use `/health` for ALB and ECS health checks; Formbricks deliberately keeps that endpoint
independent of its authorization engine.

Before a production release, configure Cloudflare `surveys.calmos.io` to the ALB, issue an ACM certificate,
set Cloudflare SSL to Full (strict), and set the public URL variables shown in the template. None of these
steps are performed by this branch.

## Data residency and external services

The template defaults to `eu-west-2`; AWS region remains configurable. PostgreSQL records and S3 objects
stay in the selected AWS region when the named resources are provisioned there. SMTP, telemetry, analytics,
AI providers and configured third-party integrations can transmit data outside AWS. Keep them unset unless
separately assessed; AI features remain off until a provider is configured.
