/**
 * k6 Load Testing Script for HelpDeskApp
 * 
 * This script performs load testing on critical API endpoints.
 * 
 * Prerequisites:
 * - Install k6: https://k6.io/docs/getting-started/installation/
 * - Application running at BASE_URL
 * - Valid authentication token (set AUTH_TOKEN environment variable)
 * 
 * Usage:
 *   k6 run scripts/load-test-k6.js
 * 
 * With custom options:
 *   k6 run --vus 50 --duration 5m scripts/load-test-k6.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const ticketListDuration = new Trend('ticket_list_duration');
const ticketCreateDuration = new Trend('ticket_create_duration');
const ticketDetailDuration = new Trend('ticket_detail_duration');
const commentCreateDuration = new Trend('comment_create_duration');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 50 },  // Ramp up to 50 users
    { duration: '2m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_failed': ['rate<0.01'],    // Error rate should be less than 1%
    'errors': ['rate<0.01'],
    'ticket_list_duration': ['p(95)<200'],
    'ticket_create_duration': ['p(95)<300'],
    'ticket_detail_duration': ['p(95)<100'],
    'comment_create_duration': ['p(95)<200'],
  },
};

// Helper function to create authenticated request
function authenticatedRequest(method, url, body = null) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `next-auth.session-token=${AUTH_TOKEN}`,
    },
  };

  if (body) {
    params.body = JSON.stringify(body);
  }

  return http.request(method, url, body ? JSON.stringify(body) : null, params);
}

// Test data
let ticketId = null;

export default function () {
  // 1. Get ticket list
  const listStart = Date.now();
  const listRes = authenticatedRequest('GET', `${BASE_URL}/api/tickets?limit=20`);
  const listDuration = Date.now() - listStart;
  ticketListDuration.add(listDuration);

  const listCheck = check(listRes, {
    'ticket list status is 200': (r) => r.status === 200,
    'ticket list has items': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.items && Array.isArray(body.items);
      } catch {
        return false;
      }
    },
  });

  if (!listCheck) {
    errorRate.add(1);
  }

  sleep(1);

  // 2. Get ticket detail (if we have a ticket ID from previous requests)
  if (ticketId) {
    const detailStart = Date.now();
    const detailRes = authenticatedRequest('GET', `${BASE_URL}/api/tickets/${ticketId}`);
    const detailDuration = Date.now() - detailStart;
    ticketDetailDuration.add(detailDuration);

    const detailCheck = check(detailRes, {
      'ticket detail status is 200': (r) => r.status === 200,
      'ticket detail has id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.ticket && body.ticket.id;
        } catch {
          return false;
        }
      },
    });

    if (!detailCheck) {
      errorRate.add(1);
    }

    sleep(1);

    // 3. Create comment on ticket
    const commentStart = Date.now();
    const commentRes = authenticatedRequest('POST', `${BASE_URL}/api/tickets/${ticketId}/comments`, {
      bodyMd: `Load test comment ${Date.now()}`,
      isInternal: false,
    });
    const commentDuration = Date.now() - commentStart;
    commentCreateDuration.add(commentDuration);

    const commentCheck = check(commentRes, {
      'comment create status is 200': (r) => r.status === 200,
      'comment created successfully': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.comment && body.comment.id;
        } catch {
          return false;
        }
      },
    });

    if (!commentCheck) {
      errorRate.add(1);
    }

    sleep(1);
  }

  // 4. Create ticket (every 10th request to avoid flooding)
  if (__ITER % 10 === 0) {
    const createStart = Date.now();
    const createRes = authenticatedRequest('POST', `${BASE_URL}/api/tickets`, {
      title: `Load Test Ticket ${Date.now()}`,
      descriptionMd: 'This is a load test ticket created during performance testing.',
      priority: 'SREDNI',
      category: null,
    });
    const createDuration = Date.now() - createStart;
    ticketCreateDuration.add(createDuration);

    const createCheck = check(createRes, {
      'ticket create status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'ticket created successfully': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.ticket && body.ticket.id) {
            ticketId = body.ticket.id; // Store for subsequent requests
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    });

    if (!createCheck) {
      errorRate.add(1);
    }

    sleep(2);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}Load Test Summary\n`;
  summary += `${indent}==================\n\n`;
  
  // HTTP metrics
  summary += `${indent}HTTP Metrics:\n`;
  summary += `${indent}  Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}  Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
  summary += `${indent}  P95 Duration: ${data.metrics.http_req_duration.values.p95.toFixed(2)}ms\n`;
  summary += `${indent}  P99 Duration: ${data.metrics.http_req_duration.values.p99.toFixed(2)}ms\n\n`;
  
  // Custom metrics
  if (data.metrics.ticket_list_duration) {
    summary += `${indent}Ticket List:\n`;
    summary += `${indent}  P95: ${data.metrics.ticket_list_duration.values.p95.toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${data.metrics.ticket_list_duration.values.p99.toFixed(2)}ms\n\n`;
  }
  
  if (data.metrics.ticket_create_duration) {
    summary += `${indent}Ticket Create:\n`;
    summary += `${indent}  P95: ${data.metrics.ticket_create_duration.values.p95.toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${data.metrics.ticket_create_duration.values.p99.toFixed(2)}ms\n\n`;
  }
  
  if (data.metrics.ticket_detail_duration) {
    summary += `${indent}Ticket Detail:\n`;
    summary += `${indent}  P95: ${data.metrics.ticket_detail_duration.values.p95.toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${data.metrics.ticket_detail_duration.values.p99.toFixed(2)}ms\n\n`;
  }
  
  if (data.metrics.comment_create_duration) {
    summary += `${indent}Comment Create:\n`;
    summary += `${indent}  P95: ${data.metrics.comment_create_duration.values.p95.toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${data.metrics.comment_create_duration.values.p99.toFixed(2)}ms\n\n`;
  }
  
  // Thresholds
  summary += `${indent}Thresholds:\n`;
  const thresholds = data.metrics.http_req_duration.thresholds || {};
  Object.keys(thresholds).forEach(key => {
    const threshold = thresholds[key];
    const status = threshold.ok ? '✅ PASS' : '❌ FAIL';
    summary += `${indent}  ${key}: ${status}\n`;
  });
  
  return summary;
}

