# Local AI with Ollama

## Scope and prerequisite gaps

Phase 05 adds a server-only Ollama provider, a student concept-note tutor, and teacher
practice drafts. No paid AI API, cloud fallback, or AI SDK is required. Existing
native fetch, Zod, authentication, Prisma read services and UI primitives are reused.

This checkout still lacks Phase 02 lecture delivery/progress, Phase 03 assessment,
and Phase 04 mastery/recommendation implementations. The tutor is a separate view
with an authorized lesson selector, **not a panel inside a working lecture player**.
It reads existing mapped Concept.description notes; it does not invent lesson
bodies. Missing notes produce a no-context message without inference. No mastery,
misconceptions, assessment feedback, answer keys or next-activity records exist to
personalize from. Those integrations remain blocked, not simulated.

Teacher output is an ephemeral unapproved draft. There is no save, approval record,
publish endpoint, scored assessment or automatic grading integration. It cannot be
published without implementing the missing reviewed-assessment workflow. The UI
states this explicitly. No AI code writes mastery, results or other learning records.

## Hardware observed on this Windows machine

| Item | Observation |
| --- | --- |
| OS | Windows 11 Home, 64-bit, build 10.0.26200 |
| CPU | Intel Core i5-1135G7, 4 cores / 8 logical processors |
| RAM | 8,047,912 KiB visible (about 7.68 GiB); about 1.2 GiB free at initial inspection |
| GPU | Intel Iris Xe integrated graphics; WMI reports 1 GiB AdapterRAM, not verified dedicated VRAM |
| Free disk | Initially about 33.6 GiB on C: and 85.2 GiB on D: |
| Selected model | qwen3:1.7b; Q4_K_M, approximately 1.4 GB download |
| Inference backend | Ollama startup reports CPU; no discrete GPU assumed |

Use only one concurrent generation, 4096 context tokens, bounded prompts, and 512
output tokens by default. Available RAM is tight; close unnecessary applications
before inference. Model availability is not a guarantee of enough free RAM to load
it. A 4B model was not downloaded or evaluated. Actual inference results and timing
are recorded in VERIFICATION.md; do not infer performance from the hardware alone.

## Installation

The standard supported setup is the [official Windows installer](https://ollama.com/download/windows),
as described in [Ollama's Windows documentation](https://docs.ollama.com/windows).
Alternatively:

```powershell
winget install --id Ollama.Ollama --exact --source winget
```

This session's winget download stalled at zero bytes. The large installer download
was stopped after slow progress. Instead, the official v0.40.4 standalone Windows
archive was used: unchanged CPU files and license notices were extracted using
HTTP byte ranges, excluding unused CUDA/Vulkan/ROCm/MLX libraries. ZIP CRCs were
validated and Windows verified the ollama.exe Authenticode signature as Valid.
The installation is local to `.verification/ollama/standalone`, not on PATH and
not registered as a Windows service. GPU acceleration is not part of this setup.
The ignored extraction helper is a local setup artifact, not an application dependency.

The official standalone archive is:
https://github.com/ollama/ollama/releases/download/v0.40.4/ollama-windows-amd64.zip

For another machine, prefer the ordinary installer or extract that official ZIP.
Do not reuse or run the incomplete OllamaSetup.exe in the verification directory.

## Start the server and pull the model

If the Ollama tray application is running, quit it before starting this controlled
server. From the project directory, in a dedicated PowerShell window:

```powershell
powershell.exe -NoProfile -File .\scripts\start-local-ai.ps1
```

The script selects an installed CLI or this workspace's standalone copy. It sets
OLLAMA_HOST=127.0.0.1:11434, OLLAMA_NO_CLOUD=1, OLLAMA_NUM_PARALLEL=1,
OLLAMA_MAX_LOADED_MODELS=1, OLLAMA_MAX_QUEUE=2, and OLLAMA_CONTEXT_LENGTH=4096.
For the standalone copy, model files stay in ignored .verification/ollama/models.
No machine-wide environment settings are changed. Ctrl+C stops a foreground server.

In another terminal, for this workspace's installation:

```powershell
& .\.verification\ollama\standalone\ollama.exe pull qwen3:1.7b
& .\.verification\ollama\standalone\ollama.exe list
Invoke-RestMethod http://127.0.0.1:11434/api/version
```

For a normal installer with Ollama on PATH, use `ollama pull qwen3:1.7b` and
`ollama list`. Downloading the model requires internet access. The selected runtime
is configured for local inference only. Internet-disabled operation has **not**
been tested, so this release does not claim verified offline operation.

## Next.js configuration and startup

The following settings are server-only and must not use NEXT_PUBLIC_ names:

```dotenv
LOCAL_AI_ENABLED=true
LOCAL_AI_BASE_URL=http://127.0.0.1:11434
LOCAL_AI_MODEL=qwen3:1.7b
LOCAL_AI_TIMEOUT_MS=120000
LOCAL_AI_MAX_OUTPUT_TOKENS=512
```

Existing database/auth secrets remain in .env.local. No external AI key is needed.
The provider defaults to disabled when the flag is absent. It only accepts literal
loopback HTTP addresses (127.0.0.1 or [::1]), rejects credentials/path/query/fragment
configuration, refuses redirects, and allowlists qwen3:1.7b. Supporting another model
requires an explicit reviewed allowlist change; cloud tags are not accepted.

```powershell
npm.cmd run dev -- --hostname localhost --port 3000
```

Open http://localhost:3000 and register/sign in. Students use **Local study tutor**
from their dashboard; teachers use **AI practice drafts**. The URLs are
/dashboard/student/tutor and /dashboard/teacher/practice-drafts. New accounts
without authorized course lessons get an empty state. The app does not automatically
seed users, enroll them, or create fictional course notes. Existing course-authoring
UI is absent; guarded test fixtures demonstrate the integration in the test DB.

## Provider, data boundaries and limits

- `src/server/ai` contains the typed provider, config, limits, retrieval and services.
  Every module imports server-only. Clients call authenticated application routes,
  never Ollama directly. There is no unrestricted chat/model-proxy endpoint.
- Students can read only published courses in which their current authenticated
  identity is enrolled. Teachers can generate from only their own lessons. IDs,
  roles, model settings and mastery supplied by clients are never trusted.
- Retrieval is bounded to three mapped concepts, 500 characters per description;
  no full-course fetch, embedding service or external document import occurs.
- Tutor requests allow a 400-character question and four history entries; only the
  last two, shortened to 300 characters each, enter the prompt. Displayed recent
  history is in React memory only and clears on navigation or explicit reset.
- HTTP JSON bodies are capped at 12 KB. Provider input allows at most ten messages
  and 10,000 total characters. Context is capped at 4096 tokens; character caps are
  not a tokenizer and very dense/multilingual prompts may exhaust that window.
- Output is capped at 512 tokens by default (configurable 32–768), 12,000 characters,
  and 256 KiB of streamed protocol data. Requests time out after 120 seconds by
  default (configurable 1–180 seconds), and disconnect/cancel aborts upstream fetch.
- There is one active inference per Node process and six requests/minute/user;
  status checks have a separate quota. Quotas are in-memory, bounded, and reset on
  process restart. This is a single-instance local setup, not a distributed limiter.
- Stream errors become explicit UI errors; drafts are buffered until JSON-schema,
  question-type, answer-index, uniqueness and allowed-concept validation succeeds.
  Generation schemas constrain choice questions to four options, single-choice to
  exactly one answer index, multiple-select to two or three indexes, and short-answer
  to empty choice arrays. The requested type/difficulty and actual concept IDs are
  constrained in the schema as well as checked after generation.
- No prompts, student text, or model responses are logged by the app. Model errors
  are sanitized. The standalone smoke script logs only its synthetic test prompts'
  responses, never student material.
- Course notes are serialized as untrusted data and separated from system rules.
  The model has no tools, file/network actions, grading permissions or database-write
  capability. User/model text renders as plain React text, not HTML or Markdown links.
  The source list is built from actual retrieved records, not model-generated citations.
  Prompt rules reduce injection risk but cannot prove factual correctness or perfect
  instruction adherence. A model can still hallucinate; review is necessary.

## Verification

```powershell
npm.cmd run ai:smoke
npm.cmd run check
npm.cmd test
npm.cmd run test:db
npm.cmd run build
$env:RUN_AUTH_E2E='true'
$env:RUN_LOCAL_AI_E2E='false'
npm.cmd run test:e2e
# Separate real-model browser run (never mocked):
$env:RUN_LOCAL_AI_E2E='true'
npm.cmd --prefix tests run test:e2e -- local-ai.spec.ts
```

The smoke command executes the application's server-only provider via the
react-server export condition, making a real chat and validated structured-output
request. It fails when the model is absent/unavailable. The browser tests use a
dedicated local _test database, create synthetic concept notes, authenticate real
users and clean up their fixtures. `RUN_LOCAL_AI_E2E=false` deliberately tests
disabled AI and skips inference: those results are not proof of a model response.
See VERIFICATION.md for the actual executed results and unresolved workflows.

Real provider smoke succeeded with qwen3:1.7b (digest prefix 8f68893c685c):
"Two plus two is four." and validated JSON `{"answer":"4"}` in 4,907 ms combined.
`ollama ps` reported a 1.9 GB footprint, 100% CPU and 4096 context tokens. The real
student browser flow initially completed in about 7–10 seconds. A synthetic draft
run logged about 15.7 generated tokens/second. These are small local probes, not a
throughput benchmark or guarantee under memory pressure. The first real teacher
draft had invalid answer indexes and was rejected; generation constraints were
tightened rather than bypassing validation. See the final browser results in
VERIFICATION.md for the follow-up outcome: 14 passed and 2 intentionally skipped
across desktop and mobile, including real tutoring and all three draft question
types. Final checks also passed ESLint, strict TypeScript, 43 unit tests and the
production build. The separate full regression run passed 39 browser tests with
5 intentional skips.

## License and deployment

The [Qwen3 model listing](https://ollama.com/library/qwen3:1.7b) identifies Apache
License 2.0; [Ollama's source license](https://github.com/ollama/ollama/blob/main/LICENSE)
is MIT. Retain bundled notices and review the exact model/runtime licenses for
your intended distribution. No claims about suitability or educational accuracy
follow from the license.

Never bind Ollama to a public interface without an appropriate security layer.
The raw API has no application enrollment checks. Next.js supplies those checks
for this local setup. A remote deployment also needs approved data location,
durable quotas, TLS, service supervision, backups and resolved dependency findings.
Do not add a cloud fallback to handle unavailable local hardware.
