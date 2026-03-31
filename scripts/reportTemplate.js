// scripts/reportTemplate.js

/**
 * Generates a minimal HTML load test report with crucial metrics
 * @param {Object} data - k6 summary data
 * @param {string} testName - Optional name of the test / API
 * @returns {Object} - HTML only, with filename based on API name + timestamp
 */
export function handleSummary(data, testName = "Load Test Summary") {

    // Response time metrics
    const httpReq = data.metrics.http_req_duration?.values ?? {};

    // Core metrics
    const totalReqs = data.metrics.http_reqs?.values?.count ?? 0;
    const reqRate = data.metrics.http_reqs?.values?.rate ?? 0;
    const iterationRate = data.metrics.iterations?.values?.rate ?? 0;

    const failedRate = data.metrics.http_req_failed?.values?.rate ?? 0;
    const errorRate = (failedRate * 100).toFixed(2);

    const checks = data.metrics.checks?.values ?? {};
    const successRate = ((checks.rate ?? 0) * 100).toFixed(2);

    const vusMax = data.metrics.vus_max?.values?.max ?? 0;
    const vus = data.metrics.vus?.values?.value ?? 0;

    const duration =
        (data.state?.testRunDurationMs ?? 0) / 1000;

    // Extract script name
    const scriptName = testName.includes('/') || testName.includes('\\')
        ? testName.split(/[\\/]/).pop().replace(/\.[^/.]+$/, '')
        : testName;

    const safeFileName = scriptName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    let fileName;
    if (__ENV.SINGLE_TEST) {
        fileName = 'report.html';
    } else {
        const now = new Date();
        const timestamp = now.toISOString()
            .replace("T", "_")
            .replace(/:/g, "-")
            .split(".")[0];

        fileName = `${safeFileName}_${timestamp}.html`;
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${testName}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 60%; margin: 20px auto; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
            th { background-color: #f4f4f4; }
            tr:nth-child(even) { background-color: #fafafa; }
        </style>
    </head>
    <body>
        <h1>${testName}</h1>

        <table>
            <tr><th>Metric</th><th>Value</th></tr>

            <tr><td>Test Duration</td><td>${duration.toFixed(2)} s</td></tr>
            <tr><td>Virtual Users (active)</td><td>${vus}</td></tr>
            <tr><td>Virtual Users (max)</td><td>${vusMax}</td></tr>

            <tr><td>Total Requests</td><td>${totalReqs}</td></tr>
            <tr><td>Throughput (req/sec)</td><td>${reqRate.toFixed(2)}</td></tr>
            <tr><td>Iterations/sec</td><td>${iterationRate.toFixed(2)}</td></tr>

            <tr><td>Success Rate</td><td>${successRate}%</td></tr>
            <tr><td>Error Rate</td><td>${errorRate}%</td></tr>

            <tr><td>Avg Response Time</td><td>${httpReq.avg?.toFixed(2) ?? 0} ms</td></tr>
            <tr><td>p90 Response Time</td><td>${httpReq["p(90)"]?.toFixed(2) ?? 0} ms</td></tr>
            <tr><td>p95 Response Time</td><td>${httpReq["p(95)"]?.toFixed(2) ?? 0} ms</td></tr>
            <tr><td>Max Response Time</td><td>${httpReq.max?.toFixed(2) ?? 0} ms</td></tr>

        </table>

        <div style="text-align: center; margin: 20px;">
            <button onclick="downloadReport()" 
                style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Save Report
            </button>
        </div>

        <script>
            function downloadReport() {
                const html = document.documentElement.outerHTML;
                const blob = new Blob([html], {type: 'text/html'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '${fileName}';
                a.click();
                URL.revokeObjectURL(url);
            }
        </script>

    </body>
    </html>
    `;

    return { [fileName]: html };
}