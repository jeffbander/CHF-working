'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from './risk-badge';
import { Patient } from '@/types/clinical';
import { Search, Eye, Phone, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PatientTableProps {
  patients: Patient[];
  onPatientSelect?: (patient: Patient) => void;
  onCallPatient?: (patient: Patient) => void;
}

export function PatientTable({ patients, onPatientSelect, onCallPatient }: PatientTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Patient>('currentRisk');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.demographics.firstName.toLowerCase().includes(query) ||
      patient.demographics.lastName.toLowerCase().includes(query) ||
      patient.demographics.mrn.toLowerCase().includes(query) ||
      patient.demographics.phoneNumber.includes(searchQuery)
    );
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortField === 'currentRisk') {
      const aValue = a.currentRisk.score;
      const bValue = b.currentRisk.score;
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    }
    return 0;
  });

  const formatLastUpdated = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-600">↗️</span>;
      case 'deteriorating':
        return <span className="text-red-600">↘️</span>;
      case 'stable':
        return <span className="text-blue-600">➡️</span>;
      default:
        return <span className="text-gray-600">—</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, MRN, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {sortedPatients.length} of {patients.length} patients
        </div>
      </div>

      {/* Patient table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Patient</TableHead>
              <TableHead className="font-semibold">MRN</TableHead>
              <TableHead 
                className="font-semibold cursor-pointer hover:text-primary"
                onClick={() => {
                  if (sortField === 'currentRisk') {
                    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortField('currentRisk');
                    setSortDirection('desc');
                  }
                }}
              >
                Risk Status {sortField === 'currentRisk' && (
                  sortDirection === 'desc' ? '↓' : '↑'
                )}
              </TableHead>
              <TableHead className="font-semibold">Trend</TableHead>
              <TableHead className="font-semibold">Last Updated</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPatients.map((patient) => (
              <TableRow 
                key={patient.id}
                className={`
                  ${patient.currentRisk.level === 'critical' ? 'bg-red-50 hover:bg-red-100' : ''}
                  ${patient.currentRisk.level === 'high' ? 'bg-orange-50 hover:bg-orange-100' : ''}
                  hover:bg-slate-50 cursor-pointer
                `}
                onClick={() => onPatientSelect?.(patient)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(patient.currentRisk.level === 'critical' || patient.currentRisk.level === 'high') && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {patient.demographics.firstName} {patient.demographics.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {new Date(patient.demographics.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {patient.demographics.mrn}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RiskBadge 
                    level={patient.currentRisk.level}
                    score={patient.currentRisk.score}
                    size="sm"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(patient.currentRisk.trend)}
                    <span className="text-sm capitalize">
                      {patient.currentRisk.trend}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatLastUpdated(patient.currentRisk.lastUpdated)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{patient.demographics.phoneNumber}</p>
                    {patient.demographics.email && (
                      <p className="text-muted-foreground truncate max-w-[150px]">
                        {patient.demographics.email}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPatientSelect?.(patient);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCallPatient?.(patient);
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No patients found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}