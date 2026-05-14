# QA Automation Demo

A full end-to-end QA automation pipeline built with Selenium WebDriver, Jest, Jenkins, and Docker. This project demonstrates real-world QA engineering patterns including black box testing, CI/CD integration, automated reporting, and email notifications.

---

## What This Does

Every time code is pushed to GitHub:

1. GitHub fires a webhook to Jenkins
2. Jenkins spins up a Node.js Docker container
3. Chromium and ChromeDriver install inside the container
4. Jest runs all Selenium test suites
5. An HTML test report is generated and archived
6. A pass/fail email notification is sent
7. GitHub commit status is updated with the result

---

## Architecture

```
Developer pushes code
        │
        ▼
   GitHub Webhook
        │
        ▼
  Jenkins (Docker)
        │
        ▼
Node 20 Container
        │
   ┌────┴────┐
   │         │
Chromium   Jest
   │         │
   └────┬────┘
        │
        ▼
  Test Results
        │
   ┌────┴────┐
   │         │
HTML      Email
Report  Notification
```

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Selenium WebDriver | Browser automation |
| Jest | Test runner and assertions |
| Jenkins | CI/CD pipeline orchestration |
| Docker | Containerized build environment |
| Node.js 20 | Runtime |
| Chromium | Headless browser |
| jest-html-reporter | HTML test report generation |
| ngrok | Webhook tunnel for local Jenkins |
| GitHub Webhooks | Automatic build triggers |

---

## Test Suites

### `tests/sample.test.js`
Basic sanity tests to verify the test runner is working correctly.

### `tests/selenium.test.js`
Black box browser tests against a live website:

| Test | What It Verifies |
|------|-----------------|
| Page title loads | Site is reachable and returns expected content |
| Request a Quote button | Button is present and clickable |

**Testing Philosophy:** All tests are written from the user's perspective using visible text selectors — no internal IDs or CSS classes. This is intentional black box methodology that catches real user-facing regressions.

---

## Pipeline Stages

```
Checkout Code → Run QA in Node Container → Post Actions
                        │                       │
                   npm install            Archive HTML Report
                   npm test               Send Email Notification
                   jest                   Update GitHub Status
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

### Install dependencies
```bash
npm install
```

### Run tests locally
```bash
npm test
```

### Run the full pipeline
Push any commit to `main` — the Jenkins webhook will trigger automatically.

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

The pipeline is defined in `Jenkinsfile` at the root of the repo and uses a Multibranch Pipeline job.

---

## Test Report

After every build an HTML report is archived in Jenkins showing:
- Total tests run
- Pass / fail count
- Failure messages and stack traces
- Timestamp

Navigate to the build in Jenkins and click **test-report.html** under **Build Artifacts** to view it.

---

## Email Notifications

Jenkins sends an automated email after every build:
- ✅ **PASSED** — all tests green
- ❌ **FAILED** — includes build URL for investigation

---

## Roadmap

### Near Term
- [ ] Screenshot capture on test failure — saves browser state at the moment a test fails for easier debugging
- [ ] Test coverage across multiple pages — extend selenium tests to cover additional user flows beyond the homepage
- [ ] Docker layer caching — eliminate the 640MB Chromium reinstall on every build to significantly reduce build times

### Medium Term
- [ ] Smoke test vs regression test separation — categorize tests by priority so fast smoke tests can run on every commit and full regression runs nightly
- [ ] Parameterized builds — run tests against multiple environments (dev, staging, production) from a single pipeline
- [ ] Retry logic for flaky tests — automatically retry failed tests once before marking them as failures

### Long Term
- [ ] Cross-browser testing — extend beyond Chromium to Firefox and Safari
- [ ] Performance benchmarking — track page load times across builds and alert on regressions
- [ ] Visual regression testing — screenshot comparison to catch unintended UI changes
- [ ] Slack notifications — in addition to email, post build results to a Slack channel

---

## Author

**Jason Strang** — Software Developer / QA Automation Engineer  
[github.com/Jstrang8687](https://github.com/Jstrang8687)