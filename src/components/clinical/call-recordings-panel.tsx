'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Play, 
  Download, 
  Clock, 
  User, 
  Calendar,
  RefreshCw,
  Volume2
} from 'lucide-react';

interface CallRecording {
  sid: string;
  callSid: string;
  duration: string;
  dateCreated: string;
  uri: string;
  mediaUrl: string;
  callDetails?: {
    to: string;
    from: string;
    status: string;
    duration: string;
    startTime: string;
    endTime: string;
  };
  error?: string;
}

interface CallRecordingsPanelProps {
  callSid?: string;
}

export function CallRecordingsPanel({ callSid }: CallRecordingsPanelProps) {
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = callSid 
        ? `/api/call-recordings?callSid=${callSid}`
        : '/api/call-recordings';
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRecordings(data.recordings || []);
      } else {
        setError(data.error || 'Failed to load recordings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, [callSid]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (duration: string) => {
    const seconds = parseInt(duration);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +12016920949 to (201) 692-0949
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.substring(1);
      return `(${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading recordings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={loadRecordings} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Recordings
          </CardTitle>
          <CardDescription>
            Recent voice assessment recordings and transcripts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No recordings found</p>
            <p className="text-sm">
              {callSid 
                ? 'This call may not have generated recordings yet, or the call is still in progress.'
                : 'Make some patient calls to see voice recordings and assessments here.'
              }
            </p>
            <Button onClick={loadRecordings} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Recordings
            </CardTitle>
            <CardDescription>
              {callSid ? 'Recordings for this call' : `${recordings.length} recent recordings`}
            </CardDescription>
          </div>
          <Button onClick={loadRecordings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordings.map((recording) => (
          <div key={recording.sid} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {recording.callDetails ? formatPhoneNumber(recording.callDetails.to) : 'Unknown'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {recording.callDetails?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(recording.dateCreated)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(recording.duration)}
                </div>
                <div>
                  Call Duration: {recording.callDetails?.duration ? formatDuration(recording.callDetails.duration) : 'N/A'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(recording.mediaUrl, '_blank')}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = recording.mediaUrl;
                    link.download = `recording-${recording.sid}.mp3`;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {recording.error && (
              <p className="text-red-600 text-sm mt-2">⚠️ {recording.error}</p>
            )}
            
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <p>Call SID: {recording.callSid}</p>
              <p>Recording SID: {recording.sid}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}