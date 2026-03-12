# MSupport Load Test Framework

A simple K6-based load testing framework for the MSupport API. Designed to simulate user logins and API requests under load.

##  Quick Start

1. **Clone the repository:**

```bash
git clone <repository-url>
cd MSupport-performance-test
npm install
```

2. **Run a basic test:**

```bash
k6 run sample.js
```

3. **Run login test:**

```bash
k6 run tests/login-test.js
```

4. **Run organization search test:**

```bash
k6 run tests/organizations-search-test.js
```

---

##  Repository Structure

```
MSupport-performance-test/
├── config/                  # Config files
├── data/
├── scripts/                 # Token generation utilities
├── tests/                   # Test scripts (login, search, etc.)
├── sample.js                # Example K6 test
└── README.md
```

---

##  Token Management

### How Tokens Work

1. Test users are loaded from hardcoded test users.
2. Each user logs in via `POST /auth/login`.
3. Tokens (`access_token`) are extracted from response headers.
4. Tokens are stored in a pool and reused in tests.

### Use Tokens in Tests

```javascript
export function setup() {
    return generateTokenPool(users); // Generates token pool
}

export default function(tokens) {
    const token = tokens[(__VU - 1) % tokens.length];
    http.get(`${BASE_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}
```

### Generate Tokens Standalone

```bash
k6 run scripts/generate_tokens.js
```

---

##  Running Tests

```bash
# Login test
k6 run tests/login-test.js

# Organization search test
k6 run tests/organizations-search-test.js
```

Override options:

```bash
k6 run -e VUS=50 -e DURATION=5m tests/organizations-search-test.js
```

---

##  Adding New Tests

1. Create a new file in `tests/`.
2. Import modules:

```javascript
import http from 'k6/http';
import { check } from 'k6';
import { generateTokenPool } from '../scripts/generate_tokens.js';
```

3. Generate tokens in `setup()`.
4. Implement API calls in `default()`.
5. Add checks:

```javascript
check(res, { 'status is 200': (r) => r.status === 200 });
```

---

## ⚙️ Customizing Load

```javascript
export const options = {
    vus: 10,
    duration: '2m'
};

// Or ramping scenarios
export const options = {
    scenarios: {
        ramp_up: {
            executor: 'ramping-vus',
            startVUs: 1,
            stages: [
                { duration: '30s', target: 10 },
                { duration: '1m', target: 50 },
                { duration: '30s', target: 0 }
            ]
        }
    }
};
```

---

