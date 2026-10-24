# Run Code and File Operations in Sandboxes

Allowing an agent to execute code changes the system's risk profile. A narrow search tool exposes one application operation; a shell can invoke many operations through one interface. A sandbox constrains what those programs can access and consume. Its effectiveness comes from actual operating system or virtualization controls, not from telling the model to stay inside a folder.

## Start with a threat model

List what the runtime must protect: host files, other tenants, network services, credentials and resource availability. Then identify what executed code genuinely needs. A report formatter may need temporary files and a specific document library. It probably does not need access to the host home directory, the container daemon socket or arbitrary outbound network destinations.

Choose an isolation mechanism appropriate to untrusted code and your environment. Containers can provide useful process and filesystem separation, but they share important host resources and depend on configuration. Stronger workloads may require additional isolation layers. Avoid treating the word container as a complete security guarantee.

Define resource limits for CPU, memory, process count, disk and execution time. Resource exhaustion can affect other runs even if file access is restricted. Set cleanup behavior for abandoned environments, but retain selected diagnostic artifacts under controlled access when needed to investigate failures.

## Build a constrained worker

A practical worker receives a validated task, an immutable environment identifier and an assigned workspace. It runs as an unprivileged user with a minimal filesystem, limited mounts and controlled network access. Dependencies should come from a reviewed environment image or controlled package source rather than being fetched freely on every run.

```text
job = validate_execution_request(request)
environment = create_isolated_environment(
    image=job.pinned_image,
    workspace=job.scoped_workspace,
    network=job.allowed_destinations,
    resources=job.limits,
    privileged=false
)
result = environment.run(job.program, deadline=job.deadline)
collect_bounded_outputs(result)
terminate_and_clean(environment)
```

This is an architectural outline, not a secure container configuration. Review the actual hosting platform's controls. Do not mount the host root filesystem or expose a management socket to make development convenient. Those choices can undermine the intended boundary.

## Handle paths and artifacts

Resolve file paths against a designated workspace and reject traversal outside it. Be careful with symbolic links, archive extraction and time-of-check versus time-of-use races. A textual prefix check alone is inadequate when a symlink can redirect an allowed-looking path. Prefer filesystem APIs and isolation controls that make disallowed locations unreachable.

Treat exported artifacts as untrusted. Check size, media type and destination before moving them into application storage. A generated HTML file can contain scripts; an archive can contain dangerous paths. The sandbox boundary should continue into artifact handling rather than ending as soon as a command exits successfully.

## Keep credentials outside arbitrary code

Whenever possible, expose a narrow authenticated proxy instead of injecting broad secrets into the execution environment. The proxy can enforce action scope, destination and budget. If code genuinely needs a credential, use short-lived credentials scoped to one run and avoid logging them. Revocation and expiration should have a defined operational path.

Test the boundary with deliberate attempts to read host files, access another workspace, reach blocked addresses and create excessive processes. These tests should run in a safe test environment. A successful command execution proves the worker can run code; it does not prove the surrounding isolation policy works.

## Plan environment reuse carefully

Reusing a sandbox can reduce startup latency but introduces residual-state risks. A previous task may leave files, processes, cached credentials or modified dependencies. For tenant isolation, prefer fresh environments or a reset mechanism whose guarantees you have tested. If a run intentionally preserves its workspace across sessions, bind that environment to the run and verify ownership before reuse. Measure startup cost separately from execution cost so performance pressure does not silently weaken cleanup or separation requirements.

## Practice

Run a document formatting program in your chosen sandbox. Permit one input directory and one output directory. Attempt a path traversal, an outbound request to a blocked destination and a process that exceeds its memory limit. Record which control rejects each attempt and verify that the host and another test workspace remain inaccessible.

## Completion checklist

- Identify the actual isolation controls and their limitations.
- Restrict privileges, mounts, network and resources.
- Validate paths and exported artifacts.
- Test both permitted work and attempted boundary violations.

Continue with [Credentials and Access Boundaries](/articles/harness-credentials-access-boundaries) and [Audit Logs and Emergency Stops](/articles/harness-audit-emergency-stop).

## References

- [Docker: Engine security](https://docs.docker.com/engine/security/)
- [OWASP: Secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
