# Manage Credentials and Tool Access Boundaries

An agent should receive the ability to perform authorized work without becoming a storage location for powerful secrets. Credential design determines whether one compromised tool result can lead to broad system access. Put authentication and authorization in trusted runtime components, and give each operation the narrowest capability it needs.

## Bind identity to the run

A run has an authenticated user or service principal, a tenant and a policy context. Carry that identity through tool execution using server-controlled metadata. Do not infer the caller from a model-generated email address or tenant identifier. The model can select a resource to act on, but application code must decide whether the run may access it.

Separate authentication from authorization. A valid API token proves some identity or delegated capability; it does not mean every resource or action is allowed. A search adapter should check collection access. A file adapter should check workspace ownership. A publication adapter should check the exact destination and approval requirements.

Where possible, use short-lived, narrowly scoped credentials or a trusted broker that performs operations on behalf of the run. The broker can restrict action type, destination and lifetime. A broad account token placed in model context is both unnecessary for reasoning and difficult to contain if it appears in logs or generated output.

## Walk through a repository tool

An assistant needs to read one repository and create a draft change. The harness resolves an authorized repository identifier and asks a credential broker for access scoped to that repository. Read operations and write operations have distinct policies. The token is supplied directly to the adapter, while the model sees only the tool's schema and safe results.

```text
resource = resolve_repository(validated_args.repository_id)
require_access(run.principal, resource, requested_operation)
credential = broker.issue(run.id, resource, operation, short_lifetime)
result = repository_adapter.execute(validated_args, credential)
return redact_and_bound(result)
```

If the model changes the repository argument after an approval, authorization must run again for the new resource. Credential reuse should not accidentally expand scope. Keep credential identifiers in audit records rather than credential values, so operators can investigate which delegation was used without exposing the secret itself.

## Treat remote tool servers carefully

Connecting a remote tool server adds another trust boundary. Review its identity, authorization flow and requested scopes. A token issued for one audience should not be passed blindly to another service. A tool server's advertised description cannot establish that it is trustworthy or entitled to receive user credentials.

For network-fetching tools, validate destinations and consider server-side request forgery. An agent may request a URL that points to internal metadata or an administrative endpoint. Destination checks must account for redirects and address resolution rather than relying only on the original URL string. Route network access through controls appropriate to the deployment environment.

## Design revocation and rotation

Authorization can change while a run waits for approval or sits in a queue. Recheck policy before consequential execution, and define how the runtime responds to revoked credentials. Do not keep retrying an authentication failure as though it were a transient network outage. Stop or request an authorized reconnection with a clear reason.

Credential rotation also affects resumed jobs. Store a reference to the required capability, not a serialized long-lived token in the checkpoint. Recovery can request a fresh credential under current policy. This reduces the chance that old run records preserve access indefinitely after an account change.

## Limit credential observability

Masking known secret strings is useful, but it is not a complete logging strategy. Credentials may be encoded, split across fields or embedded in URLs. Prefer allowlisted diagnostic fields and avoid recording raw request objects at all. Include a credential reference, scope and expiry when operators need context. Test error paths as carefully as success paths, because SDK exceptions and proxy responses can contain more authentication detail than normal tool results.

## Practice

Implement a fake credential broker for two tenants and two repositories. Give the first run read access to one repository, then attempt a write and a cross-tenant read. Revoke access while the run is waiting. Confirm that resume fails before dispatch and that neither context, traces nor error messages contain the credential value.

## Completion checklist

- Derive execution identity from trusted server context.
- Authorize each resource and operation separately.
- Keep secrets out of model input and ordinary logs.
- Support expiration, revocation and fresh credentials on resume.

Continue with [Execution Policies](/articles/harness-tool-execution-policies) and [Approval Flows](/articles/harness-approval-flows).

## References

- [OWASP: Secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Model Context Protocol: Security best practices](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices)
