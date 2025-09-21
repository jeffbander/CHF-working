#!/bin/bash

# Monitor for new biomarker analysis results
# Usage: ./monitor-biomarkers.sh

echo "🔍 BIOMARKER ANALYSIS MONITOR"
echo "============================="
echo ""
echo "📊 Monitoring for new voice analysis results..."
echo "   Server: http://localhost:3003"
echo "   Checking every 10 seconds"
echo "   Press Ctrl+C to stop"
echo ""

# Store initial count
INITIAL_COUNT=$(curl -s "http://localhost:3003/api/voice-analysis" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('total', len(data.get('results', []))))
except:
    print('0')
" 2>/dev/null)

echo "📈 Initial voice analysis count: $INITIAL_COUNT"
echo ""

# Monitor loop
COUNTER=0
while true; do
    COUNTER=$((COUNTER + 1))
    
    # Get current results
    CURRENT_DATA=$(curl -s "http://localhost:3003/api/voice-analysis" 2>/dev/null)
    
    # Parse results
    CURRENT_COUNT=$(echo "$CURRENT_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('total', len(data.get('results', []))))
except:
    print('0')
" 2>/dev/null)
    
    # Check for new results
    if [ "$CURRENT_COUNT" -gt "$INITIAL_COUNT" ]; then
        echo "🎉 NEW BIOMARKER ANALYSIS DETECTED!"
        echo "   Previous count: $INITIAL_COUNT"
        echo "   Current count: $CURRENT_COUNT"
        echo "   New results: $((CURRENT_COUNT - INITIAL_COUNT))"
        echo ""
        
        # Show latest result
        echo "$CURRENT_DATA" | python3 -c "
import sys, json
from datetime import datetime
try:
    data = json.load(sys.stdin)
    if 'results' in data and data['results']:
        latest = data['results'][0]
        print('📊 Latest Analysis Result:')
        print(f'   Patient: {latest.get(\"patientName\", \"Unknown\")}')
        print(f'   Call SID: {latest.get(\"callSid\", \"N/A\")}')
        print(f'   Risk Score: {latest.get(\"riskScore\", \"N/A\")}/100')
        print(f'   Timestamp: {latest.get(\"timestamp\", \"N/A\")}')
        
        if 'biomarkers' in latest and latest['biomarkers']:
            bio = latest['biomarkers']
            print('   Biomarkers:')
            if 'jitter' in bio:
                print(f'     Jitter: {bio[\"jitter\"].get(\"local\", \"N/A\")}')
            if 'shimmer' in bio:
                print(f'     Shimmer: {bio[\"shimmer\"].get(\"local\", \"N/A\")}')
            if 'hnr' in bio:
                print(f'     HNR: {bio[\"hnr\"].get(\"mean\", \"N/A\")} dB')
            if 'f0' in bio:
                print(f'     F0: {bio[\"f0\"].get(\"mean\", \"N/A\")} Hz')
        
        print('')
        print('✅ New biomarker analysis complete!')
        print('🌐 View in dashboard: http://localhost:3003/voice-analysis-dashboard')
        break
    else:
        print('❌ No results found in response')
except Exception as e:
    print(f'❌ Error parsing results: {e}')
" 2>/dev/null
        
        break
    fi
    
    # Show progress
    echo "[$COUNTER] Checking... (Count: $CURRENT_COUNT) - $(date '+%H:%M:%S')"
    
    # Wait 10 seconds
    sleep 10
done

echo ""
echo "🏁 Monitoring complete!"
