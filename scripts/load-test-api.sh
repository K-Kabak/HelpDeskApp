#!/bin/bash
# Simple API Load Test Script using curl
# 
# This script performs basic load testing on API endpoints using curl.
# For more comprehensive testing, use the k6 script (load-test-k6.js).
#
# Usage:
#   ./scripts/load-test-api.sh <base_url> <auth_token> <iterations>
#
# Example:
#   ./scripts/load-test-api.sh http://localhost:3000 "session-token-here" 100

BASE_URL=${1:-"http://localhost:3000"}
AUTH_TOKEN=${2:-""}
ITERATIONS=${3:-100}

if [ -z "$AUTH_TOKEN" ]; then
  echo "Error: AUTH_TOKEN is required"
  echo "Usage: $0 <base_url> <auth_token> <iterations>"
  exit 1
fi

echo "=== API Load Test ==="
echo "Base URL: $BASE_URL"
echo "Iterations: $ITERATIONS"
echo ""

# Results arrays
declare -a ticket_list_times
declare -a ticket_create_times
declare -a errors

# Test ticket list endpoint
echo "Testing GET /api/tickets..."
for i in $(seq 1 $ITERATIONS); do
  start=$(date +%s%N)
  response=$(curl -s -w "\n%{http_code}" -H "Cookie: next-auth.session-token=$AUTH_TOKEN" \
    "$BASE_URL/api/tickets?limit=20")
  end=$(date +%s%N)
  
  http_code=$(echo "$response" | tail -n1)
  duration=$(( (end - start) / 1000000 )) # Convert to milliseconds
  
  if [ "$http_code" -eq 200 ]; then
    ticket_list_times+=($duration)
  else
    errors+=("GET /api/tickets: HTTP $http_code")
  fi
  
  if [ $((i % 10)) -eq 0 ]; then
    echo "  Completed $i/$ITERATIONS requests..."
  fi
done

# Calculate statistics
if [ ${#ticket_list_times[@]} -gt 0 ]; then
  IFS=$'\n' sorted=($(sort -n <<<"${ticket_list_times[*]}"))
  unset IFS
  
  count=${#sorted[@]}
  p50_index=$((count * 50 / 100))
  p95_index=$((count * 95 / 100))
  p99_index=$((count * 99 / 100))
  
  p50=${sorted[$p50_index]}
  p95=${sorted[$p95_index]}
  p99=${sorted[$p99_index]}
  
  echo ""
  echo "=== Results: GET /api/tickets ==="
  echo "Total Requests: $count"
  echo "P50: ${p50}ms"
  echo "P95: ${p95}ms"
  echo "P99: ${p99}ms"
  echo "Errors: ${#errors[@]}"
fi

# Test ticket creation (every 10th iteration)
echo ""
echo "Testing POST /api/tickets (every 10th iteration)..."
ticket_create_count=0
for i in $(seq 1 $ITERATIONS); do
  if [ $((i % 10)) -eq 0 ]; then
    start=$(date +%s%N)
    response=$(curl -s -w "\n%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -H "Cookie: next-auth.session-token=$AUTH_TOKEN" \
      -d "{\"title\":\"Load Test Ticket $i\",\"descriptionMd\":\"Test\",\"priority\":\"SREDNI\"}" \
      "$BASE_URL/api/tickets")
    end=$(date +%s%N)
    
    http_code=$(echo "$response" | tail -n1)
    duration=$(( (end - start) / 1000000 ))
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
      ticket_create_times+=($duration)
      ticket_create_count=$((ticket_create_count + 1))
    else
      errors+=("POST /api/tickets: HTTP $http_code")
    fi
  fi
done

# Calculate ticket creation statistics
if [ ${#ticket_create_times[@]} -gt 0 ]; then
  IFS=$'\n' sorted=($(sort -n <<<"${ticket_create_times[*]}"))
  unset IFS
  
  count=${#sorted[@]}
  p50_index=$((count * 50 / 100))
  p95_index=$((count * 95 / 100))
  p99_index=$((count * 99 / 100))
  
  p50=${sorted[$p50_index]}
  p95=${sorted[$p95_index]}
  p99=${sorted[$p99_index]}
  
  echo ""
  echo "=== Results: POST /api/tickets ==="
  echo "Total Requests: $count"
  echo "P50: ${p50}ms"
  echo "P95: ${p95}ms"
  echo "P99: ${p99}ms"
fi

# Summary
echo ""
echo "=== Summary ==="
echo "Total Iterations: $ITERATIONS"
echo "Ticket List Requests: ${#ticket_list_times[@]}"
echo "Ticket Create Requests: ${#ticket_create_times[@]}"
echo "Total Errors: ${#errors[@]}"

if [ ${#errors[@]} -gt 0 ]; then
  echo ""
  echo "Errors:"
  printf '%s\n' "${errors[@]}"
fi

