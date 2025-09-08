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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Bell, Shield, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsDialogProps {
  clinicianName: string;
  clinicianTitle: string;
}

export function SettingsDialog({ clinicianName, clinicianTitle }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: clinicianName,
    title: clinicianTitle,
    department: 'Cardiology',
    timezone: 'America/New_York',
    
    // Notification settings
    emailAlerts: true,
    smsAlerts: true,
    inAppNotifications: true,
    criticalAlertSound: true,
    dashboardRefresh: 30, // seconds
    
    // Clinical preferences
    defaultView: 'alerts',
    patientSortBy: 'risk',
    showLowRiskPatients: true,
    autoRefreshData: true,
    
    // Privacy settings
    sessionTimeout: 30, // minutes
    requireMFAForPatientData: true,
    auditLogAccess: false
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    localStorage.setItem('heartvoice_settings', JSON.stringify(settings));
    setOpen(false);
    // Show success message
    alert('Settings saved successfully!');
  };

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Clinical Settings
          </DialogTitle>
          <DialogDescription>
            Configure your HeartVoice Monitor preferences and notifications.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
            <TabsTrigger value="clinical">Clinical</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Profile Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={settings.displayName}
                  onChange={(e) => handleSettingChange('displayName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => handleSettingChange('title', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={settings.department}
                  onValueChange={(value) => handleSettingChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                    <SelectItem value="Nursing">Nursing</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleSettingChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Alert Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive critical patient alerts via email</p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => handleSettingChange('emailAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive urgent notifications via text message</p>
                </div>
                <Switch
                  checked={settings.smsAlerts}
                  onCheckedChange={(checked) => handleSettingChange('smsAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notification badges in the application</p>
                </div>
                <Switch
                  checked={settings.inAppNotifications}
                  onCheckedChange={(checked) => handleSettingChange('inAppNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Critical Alert Sound</Label>
                  <p className="text-sm text-muted-foreground">Play audio notification for critical alerts</p>
                </div>
                <Switch
                  checked={settings.criticalAlertSound}
                  onCheckedChange={(checked) => handleSettingChange('criticalAlertSound', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dashboardRefresh">Dashboard Refresh Interval (seconds)</Label>
                <Select
                  value={settings.dashboardRefresh.toString()}
                  onValueChange={(value) => handleSettingChange('dashboardRefresh', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Clinical Preferences */}
          <TabsContent value="clinical" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Clinical Preferences</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultView">Default Dashboard View</Label>
                <Select
                  value={settings.defaultView}
                  onValueChange={(value) => handleSettingChange('defaultView', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alerts">Critical Alerts</SelectItem>
                    <SelectItem value="patients">All Patients</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientSortBy">Default Patient Sorting</Label>
                <Select
                  value={settings.patientSortBy}
                  onValueChange={(value) => handleSettingChange('patientSortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk">Risk Score (High to Low)</SelectItem>
                    <SelectItem value="name">Patient Name (A-Z)</SelectItem>
                    <SelectItem value="lastUpdate">Last Update (Recent First)</SelectItem>
                    <SelectItem value="enrollment">Enrollment Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Low Risk Patients</Label>
                  <p className="text-sm text-muted-foreground">Display patients with low risk scores in lists</p>
                </div>
                <Switch
                  checked={settings.showLowRiskPatients}
                  onCheckedChange={(checked) => handleSettingChange('showLowRiskPatients', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Refresh Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically update patient data in background</p>
                </div>
                <Switch
                  checked={settings.autoRefreshData}
                  onCheckedChange={(checked) => handleSettingChange('autoRefreshData', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Privacy & Security</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select
                  value={settings.sessionTimeout.toString()}
                  onValueChange={(value) => handleSettingChange('sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require MFA for Patient Data</Label>
                  <p className="text-sm text-muted-foreground">Multi-factor authentication for sensitive data access</p>
                </div>
                <Switch
                  checked={settings.requireMFAForPatientData}
                  onCheckedChange={(checked) => handleSettingChange('requireMFAForPatientData', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Log Access</Label>
                  <p className="text-sm text-muted-foreground">Allow viewing of HIPAA audit logs (Admin only)</p>
                </div>
                <Switch
                  checked={settings.auditLogAccess}
                  onCheckedChange={(checked) => handleSettingChange('auditLogAccess', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}