import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateTokenPool } from '../scripts/generate_tokens.js';

export const options = {
    vus: 10,         
    duration: '10m',   
};

const URL = 'https://msupport.am/api/v1/tickets';

// Payload
const payload = JSON.stringify({
    name: "test",
    description: "qa",
    type: "problem",
    assetSerialNumber: "MBH00012",
    assetStatus: "running",
    classificationTypeKey: "failure_without_downtime",
    files: [],
    priority: "none",
    status: "to_do"
});

const params = {
    headers: {
        'Content-Type': 'application/json',
        'Cookie': 'access_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJBS0huX1UyYTF4ZXY0MHlwaUVxTzBtbkNaNHE2Wk1qQVpmaW1LQWt0dkZnIn0.eyJleHAiOjE3NzM4OTgwMjEsImlhdCI6MTc3Mzg5NzcyMSwianRpIjoib25ydHJ0OmZhN2NhMGJmLWM2MTEtNjliYi1mMjA5LWY2NzgwZjFlYzk1MSIsImlzcyI6Imh0dHA6Ly9rZXljbG9hazo4MDgwL3JlYWxtcy9tc3VwcG9ydCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJkYzU2MWVlNi1kMjA0LTRhMDYtOWU5Ny00ZjA1MTI0YjRhYjEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJtc3VwcG9ydCIsInNpZCI6Ijk0MzUzM2JlLWFiODMtNmY3Yy00MDkzLTMzM2YzODMwOWI4ZSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtbXN1cHBvcnQiLCJnbG9iYWxfYWRtaW4iLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImRhc3VuQGZjb2RlbGFicy5jb20iLCJlbWFpbCI6ImRhc3VuQGZjb2RlbGFicy5jb20ifQ.w-7LQAlKfpdH1NlYARBIEGjUlrD5OQQAkech7mBALkd2t8n2WxOa8NRNzkpe61VH1ORXLy7Jj1PXDwP2oADYKUUWIovwGeSglwoh8RRDBYmfcSoCo35HQjs734XlBGxHEU8WVL495MYuQmnvkltHwN_2e1kNQ3ptLdNpyTZMcT8CnsiUXdlnyP8CLC29x_n96R4T5SaRro0MXHzXAdQnHOk7nxguVl0qJ9VyqKjMOQcGnAFhjRChkbRZzwdNqGzQS5mSfZ5LiMQl1LNEbHuWvURPLmAawUSPaWZ0I0Mu7MjNEubPREfo342YGfEkq1ra7xKuJzp6igLS_UjoKE8vYg'
    },
};

export default function () {

    const res = http.post(URL, payload, params);

    // Debug log (important for your issue)
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${res.body}`);

    // Checks (IMPORTANT: don't rely only on status)
    check(res, {
        'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        'response success true': (r) => {
            try {
                return JSON.parse(r.body).success === true;
            } catch (e) {
                return false;
            }
        },
    });

    sleep(1);
}