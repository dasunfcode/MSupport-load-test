# MSupport API Load Tests

This repository contains a **Load testing suite** for the MSupport API built using k6.

# Project Structure

```text
MSupport-performance-test
│
├─ run-all-tests.ps1        # Runs all tests in parallel and generates a combined report
├─ run-k6.ps1               # Helper script to run a single k6 test
├─ .env                     # Environment configuration (API base URL)
│
├─ tests/                   # API load test scripts
│   ├─ login-test.js
│   ├─ create-tickets-test.js
│   ├─ search-tickets-test.js
│   ├─ update-tickets-status-test.js
│   └─ organizations-search-test.js
│
├─ scripts/                 # Shared utilities
│   ├─ config.js            # Loads BASE_URL
│   ├─ generate_tokens.js   # Creates login tokens for test users
│   ├─ ramp-config.js       # Shared load ramp stages
│   └─ reportTemplate.js    # HTML report generator
│
└─ data/
    └─ users.js             # Test user accounts
```

---

# Requirements
Install k6 using:

```powershell
choco install k6
```

Verify installation:

```powershell
k6 version
```

---

# Initial Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd MSupport-performance-test
```

---

### 2. Create `.env` file

Create a `.env` file in the root directory.

Example:

```text
BASE_URL=https://example.am/api/v1
```

This tells the tests which API environment to run against.

---

# Running Tests

## Run All Tests

Runs every test in the `tests` folder **in parallel** and generates a combined report.

```powershell
.\run-all-tests.ps1
```

This will:

1. Execute all test scripts
2. Generate HTML reports
3. Combine results into a single report

---

## Run a Single Test

Example:

```powershell
.\run-k6.ps1 run tests/login-test.js
```

---

## Run with Custom Load Settings

Example:

```powershell
.\run-k6.ps1 run -e VUS=20 -e DURATION=2m tests/login-test.js
```

Where:

* `VUS` = number of virtual users
* `DURATION` = how long the test runs

---

# Load Pattern (Ramp Configuration)

Most tests use a shared ramp configuration from:

```text
scripts/ramp-config.js
```

Example ramp pattern:

```text
0 → 10 users
10 → 30 users
30 → 50 users
50 → 0 users
```

This simulates **real traffic patterns** rather than constant load.

---

# Authentication Handling

Some endpoints require authentication.

The script:

```text
scripts/generate_tokens.js
```

logs in using users from:

```text
data/users.js
```

It extracts the `access_token` cookie and builds a **token pool** used by the test users.

Each virtual user receives a token during the test.

---

# Reports

After each test finishes, an **HTML report** is generated containing metrics such as:

| Metric                | Description                 |
| --------------------- | --------------------------- |
| Total Requests        | Total API calls made        |
| Failed Requests       | Number of failed requests   |
| Avg Response Time     | Average response time       |
| Min / Max             | Fastest and slowest request |
| p50 / p90 / p95 / p99 | Percentile latency          |
| Throughput            | Requests per second         |

Reports are generated using the template in:

```text
scripts/reportTemplate.js
```

---

# Adding a New API Load Test

Follow these steps when a new endpoint needs performance testing.

---

## 1. Create a new test file

Inside the `tests` folder:

```text
tests/new-endpoint-test.js
```

---

## 2. Import shared utilities

Example:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../scripts/config.js';
import { rampStages } from '../scripts/ramp-config.js';
import { generateTokenPool } from '../scripts/generate_tokens.js';
```

---

## 3. Setup authentication (if required)

```javascript
export function setup() {
  const tokens = generateTokenPool();
  return { tokens };
}
```

---

## 4. Write the test logic

Example:

```javascript
export default function (data) {

  const token = data.tokens[__VU % data.tokens.length];

  const res = http.get(`${BASE_URL}/new-endpoint`, {
    headers: {
      Cookie: `access_token=${token}`
    }
  });

  check(res, {
    'status is 200': (r) => r.status === 200
  });

  sleep(Math.random() * 2 + 1);
}
```

---

## 5. Define load options

```javascript
export const options = {
  stages: rampStages
};
```

---

## 6. Add report generation

```javascript
import { handleSummary as summaryTemplate } from '../scripts/reportTemplate.js';

export function handleSummary(data) {
  return summaryTemplate(data, 'New Endpoint API');
}
```

---

## 7. Add the test to `run-all-tests.ps1`

To run your new test in **parallel with all others**, open `run-all-tests.ps1` and find:

```powershell
$testFiles = @(
    "tests\create-tickets-test.js",
    "tests\login-test.js",
    "tests\organizations-search-test.js",
    "tests\search-tickets-test.js",
    "tests\update-tickets-status-test.js"
)
```

Add your new test file:

```powershell
$testFiles = @(
    "tests\create-tickets-test.js",
    "tests\login-test.js",
    "tests\organizations-search-test.js",
    "tests\search-tickets-test.js",
    "tests\update-tickets-status-test.js",
    "tests/new-endpoint-test.js"
)
```

Save the file. Now, running:

```powershell
.\run-all-tests.ps1
```

will include your new test in the combined execution and report.

---

## 8. Run your test individually (optional)

Before adding to `$testFiles`, always verify it works:

```powershell
.\run-k6.ps1 run tests/new-endpoint-test.js
```

Do you want me to do that?
