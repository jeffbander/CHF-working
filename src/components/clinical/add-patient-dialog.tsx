'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { CreatePatientRequest } from '@/types/clinical';

interface AddPatientDialogProps {
  onPatientAdded?: () => void;
}

export function AddPatientDialog({ onPatientAdded }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    mrn: '',
    phoneNumber: '',
    email: '',
    diagnosisDate: '',
    ejectionFraction: '',
    nyhaClass: '1' as '1' | '2' | '3' | '4',
    medications: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    assessmentFrequency: 'weekly' as 'daily' | 'weekly' | 'bi-weekly',
    preferredCallTimes: '',
    timezone: 'America/New_York'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const createRequest: CreatePatientRequest = {
        demographics: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          mrn: formData.mrn,
          phoneNumber: formData.phoneNumber,
          email: formData.email || undefined,
        },
        clinicalInfo: {
          diagnosisDate: formData.diagnosisDate,
          ejectionFraction: formData.ejectionFraction ? parseInt(formData.ejectionFraction) : undefined,
          nyhaClass: parseInt(formData.nyhaClass) as 1 | 2 | 3 | 4,
          medications: formData.medications.split(',').map(m => m.trim()).filter(Boolean),
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          emergencyContact: {
            name: formData.emergencyContactName,
            relationship: formData.emergencyContactRelationship,
            phoneNumber: formData.emergencyContactPhone,
          },
        },
        monitoring: {
          assessmentFrequency: formData.assessmentFrequency,
          preferredCallTimes: formData.preferredCallTimes.split(',').map(t => t.trim()).filter(Boolean),
          timezone: formData.timezone,
        },
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createRequest),
      });

      if (response.ok) {
        setOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          mrn: '',
          phoneNumber: '',
          email: '',
          diagnosisDate: '',
          ejectionFraction: '',
          nyhaClass: '1',
          medications: '',
          allergies: '',
          emergencyContactName: '',
          emergencyContactRelationship: '',
          emergencyContactPhone: '',
          assessmentFrequency: 'weekly',
          preferredCallTimes: '',
          timezone: 'America/New_York'
        });
        onPatientAdded?.();
      } else {
        const error = await response.json();
        alert(`Error creating patient: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Failed to create patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enroll a new heart failure patient in the monitoring program.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Patient Demographics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrn">Medical Record Number *</Label>
                <Input
                  id="mrn"
                  name="mrn"
                  value={formData.mrn}
                  onChange={(e) => handleInputChange('mrn', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Clinical Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosisDate">Diagnosis Date *</Label>
                <Input
                  id="diagnosisDate"
                  name="diagnosisDate"
                  type="date"
                  value={formData.diagnosisDate}
                  onChange={(e) => handleInputChange('diagnosisDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ejectionFraction">Ejection Fraction (%)</Label>
                <Input
                  id="ejectionFraction"
                  name="ejectionFraction"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ejectionFraction}
                  onChange={(e) => handleInputChange('ejectionFraction', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nyhaClass">NYHA Classification *</Label>
              <Select
                value={formData.nyhaClass}
                onValueChange={(value) => handleInputChange('nyhaClass', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select NYHA Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class I - No symptoms</SelectItem>
                  <SelectItem value="2">Class II - Slight limitation</SelectItem>
                  <SelectItem value="3">Class III - Marked limitation</SelectItem>
                  <SelectItem value="4">Class IV - Severe limitation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Medications (comma-separated)</Label>
              <Textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                placeholder="e.g., Lisinopril 10mg, Metoprolol 25mg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies (comma-separated)</Label>
              <Input
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="e.g., Penicillin, Sulfa drugs"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name *</Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                <Input
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Monitoring Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Monitoring Configuration</h3>
            <div className="space-y-2">
              <Label htmlFor="assessmentFrequency">Assessment Frequency *</Label>
              <Select
                value={formData.assessmentFrequency}
                onValueChange={(value) => handleInputChange('assessmentFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredCallTimes">Preferred Call Times (comma-separated)</Label>
              <Input
                id="preferredCallTimes"
                name="preferredCallTimes"
                value={formData.preferredCallTimes}
                onChange={(e) => handleInputChange('preferredCallTimes', e.target.value)}
                placeholder="e.g., 09:00, 14:00, 18:00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}