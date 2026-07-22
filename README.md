# QA Automation Demo

A full end-to-end QA automation pipeline built with Selenium WebDriver, Playwright, Jest, Jenkins, and Docker. This project demonstrates real-world QA engineering patterns including black box testing, dual-framework test automation, CI/CD integration, automated reporting, screenshot capture, and email notifications.

---

## What This Does

Every time code is pushed to GitHub, two independent Jenkins pipelines run in parallel:

**Selenium pipeline:**
1. GitHub fires a webhook to Jenkins
2. Jenkins spins up a Node.js Docker container
3. Chromium and ChromeDriver install inside the container
4. Jest runs all Selenium test suites
5. Screenshots are captured during each test with date-stamped filenames
6. An HTML test report is generated and archived
7. A pass/fail email notification is sent with links to artifacts
8. GitHub commit status is updated with the result

**Playwright pipeline:**
1. Same GitHub webhook triggers a second Jenkins job
2. Jenkins spins up a Node.js Docker container
3. Playwright installs Chromium, Firefox, and WebKit with all OS dependencies
4. Playwright Test runs the full suite against all three browser engines
5. An HTML report and trace files are generated and archived
6. A pass/fail email notification is sent with a link to the report

---

## Architecture

```
Developer pushes code
        │
        ▼
   GitHub Webhook
        │
        ├─────────────────────────┐
        ▼                         ▼
  Jenkins Job:              Jenkins Job:
  qa-demo-multi             qa-demo-playwright
  (Docker)                  (Docker)
        │                         │
        ▼                         ▼
Node 20 Container          Node 20 Container
        │                         │
   ┌────┴────┐              ┌─────┴─────┐
   │         │              │  Chromium │
Chromium   Jest             │  Firefox  │
   │         │              │  WebKit   │
   └────┬────┘              └─────┬─────┘
        │                         │
        ▼                         ▼
  Test Results              Test Results
        │                         │
   ┌────┴─────────┐         ┌─────┴─────┐
   │              │         │           │
HTML           Screenshots  HTML      Trace
Report        (date-stamped, Report   Files
                capped at 10
               per test)
   │              │         │           │
   └────┬─────────┘         └─────┬─────┘
        │                         │
   ┌────┴────┐               ┌────┴────┐
   │         │               │         │
Email    GitHub           Email     Report
Notice   Status            Notice   Archive
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Selenium WebDriver | Browser automation (Java-style black box testing) |
| Playwright | Cross-browser end-to-end testing (Chromium, Firefox, WebKit) |
| Jest | Test runner and assertions (Selenium suite) |
| Jenkins | CI/CD pipeline orchestration — two parallel jobs |
| Docker | Containerized build environment for both pipelines |
| Node.js 20 | Runtime |
| Chromium | Headless browser (Selenium suite) |
| jest-html-reporter | HTML test report generation (Selenium suite) |
| Playwright HTML Reporter | Test report + trace viewer (Playwright suite) |
| ngrok | Webhook tunnel for local Jenkins |
| GitHub Webhooks | Automatic build triggers for both pipelines |

---

## Test Suites

### Selenium — `tests/sample.test.js`
Basic sanity tests to verify the test runner is working correctly.

### Selenium — `tests/selenium.test.js`
Black box browser tests against a live website:

| Test | What It Verifies |
|------|-----------------|
| Page title loads | Site is reachable and returns expected content |
| Request a Quote button | Button is present and clickable |

**Testing Philosophy:** All tests are written from the user's perspective using visible text selectors — no internal IDs or CSS classes. This is intentional black box methodology that catches real user-facing regressions.

### Playwright — `playwright-tests/`
TypeScript end-to-end tests run against Chromium, Firefox, and WebKit in parallel from a single suite:

| Test | What It Verifies |
|------|-----------------|
| Page title | Site is reachable and returns expected content |
| Navigation flow | Key link/button navigates to the correct page |
| Search flow | Search input and results render as expected |

**Testing Philosophy:** Consistent with the Selenium suite — selectors use accessible roles and visible text (`getByRole`) rather than internal DOM structure, so tests reflect what a real user (or screen reader) would interact with. Playwright's auto-waiting assertions and built-in trace viewer replace manual wait logic and ad hoc debugging screenshots.

---

## Screenshot Capture

Every Selenium test automatically captures a screenshot of the browser during execution:

- **Date-stamped filenames** — `google_search_page_loads-2026-05-15_14-23-45.png`
- **Capped at 10 per test** — oldest screenshots are automatically deleted when the cap is reached, keeping a clean rolling history
- **Captured before assertions** — screenshots reflect the actual page state at test time, not after a failure
- **Archived in Jenkins** — accessible under Build Artifacts after every run

Screenshot history lets you visually track when something on the page changed and correlate it to a specific build.

The Playwright suite takes a complementary approach: instead of per-test screenshots, every run generates a **trace file** — a full recording of DOM snapshots, network activity, console logs, and screenshots for every action — viewable step-by-step in Playwright's trace viewer.

---

## Pipeline Stages

**Selenium (`Jenkinsfile`):**
```
Checkout Code → Run QA in Node Container → Post Actions
                        │                       │
                   npm install            Archive HTML Report
                   npm test               Archive Screenshots
                   jest                   Send Email Notification
                                          Update GitHub Status
```

**Playwright (`playwright-tests/Jenkinsfile.playwright`):**
```
Checkout Code → Run Playwright Tests in Node Container → Post Actions
                        │                                    │
                   npm ci                              Archive HTML Report
                   playwright install --with-deps      Archive Test Results/Traces
                   npx playwright test                 Send Email Notification
```

---

## How to Run Locally

### Prerequisites
- Docker Desktop
- Node.js 20+
- Jenkins running in Docker

### Clone the repo
```bash
git clone https://github.com/Jstrang8687/QA-automation-demo.git
cd QA-automation-demo
```

### Selenium suite
```bash
npm install
npm test
```

### Playwright suite
```bash
cd playwright-tests
npm install
npx playwright test
```

Add `--ui` to run in interactive UI mode, or `--project=chromium` to target a single browser.

### Run the full pipeline
Push any commit to `main` — both Jenkins webhooks trigger automatically, running the Selenium and Playwright pipelines in parallel.

---

## Jenkins Setup

Jenkins runs inside Docker with Docker-in-Docker support:

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

Two Jenkins jobs are configured against this repo:

| Job | Type | Script Path |
|-----|------|--------------|
| `qa-demo-multi` | Multibranch Pipeline | `Jenkinsfile` (repo root) |
| `qa-demo-playwright` | Pipeline (script from SCM) | `playwright-tests/Jenkinsfile.playwright` |

Both are triggered by the same GitHub webhook via **"GitHub hook trigger for GITScm polling"**, tunneled to local Jenkins through ngrok during development.

---

## Test Report

After every build, an HTML report is archived in Jenkins:

- **Selenium** — click **test-report.html** under Build Artifacts. Shows total tests run, pass/fail count, failure messages and stack traces, and timestamp.
- **Playwright** — click into the **playwright-report** artifact directory under Build Artifacts, or run `npx playwright show-report` locally. Includes a trace viewer link for step-by-step debugging of any run.

---

## Email Notifications

Jenkins sends an automated email after every build, from both pipelines:

- ✅ **PASSED** — confirms all tests green with a link to the build
- ❌ **FAILED** — includes direct links to:
  - Console output
  - HTML test report
  - Screenshot / trace artifacts

---

## Roadmap

### Near Term
- [x] Screenshot capture on test failure — saves browser state at the moment a test fails for easier debugging
- [x] Cross-browser testing — added via Playwright suite (Chromium, Firefox, WebKit) running in a parallel Jenkins pipeline
- [ ] Test coverage across multiple pages — extend both suites to cover additional user flows beyond the homepage
- [ ] Docker layer caching — eliminate repeated Chromium/browser reinstalls on every build to significantly reduce build times

### Medium Term
- [ ] Smoke test vs regression test separation — categorize tests by priority so fast smoke tests can run on every commit and full regression runs nightly
- [ ] Parameterized builds — run tests against multiple environments (dev, staging, production) from a single pipeline
- [ ] Retry logic for flaky tests — automatically retry failed tests once before marking them as failures
- [ ] API testing via Playwright's `request` fixture — extend coverage beyond UI to backend endpoints

### Long Term
- [ ] Performance benchmarking — track page load times across builds and alert on regressions
- [ ] Visual regression testing — screenshot comparison to catch unintended UI changes
- [ ] Slack notifications — in addition to email, post build results to a Slack channel
- [ ] Page Object Model refactor — restructure both suites around POM for long-term maintainability

---

## Author

**Jason Strang** — Software Developer / QA Automation Engineer
[github.com/Jstrang8687](https://github.com/Jstrang8687)