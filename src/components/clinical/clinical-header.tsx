'use client';

import { Bell, User, LogOut, Menu, BookOpen, Stethoscope, Cpu, Home, Headphones, Navigation, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsDialog } from './settings-dialog';
import Link from 'next/link';

interface ClinicalHeaderProps {
  clinicianName: string;
  clinicianTitle: string;
  alertCount: number;
}

export function ClinicalHeader({ clinicianName, clinicianTitle, alertCount }: ClinicalHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HV</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">HeartVoice Monitor</h1>
          </Link>
          
          {/* Navigation Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                <span className="hidden md:inline">Navigation</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Platform</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                  <Home className="h-4 w-4" />
                  Clinical Dashboard
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/voice-agent" className="flex items-center gap-2 cursor-pointer">
                  <Headphones className="h-4 w-4" />
                  Voice Agent Control Center
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/voice-analysis-dashboard" className="flex items-center gap-2 cursor-pointer">
                  <Activity className="h-4 w-4" />
                  Voice Biomarker Analysis
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/steering" className="flex items-center gap-2 cursor-pointer">
                  <Navigation className="h-4 w-4" />
                  Call Steering Control
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Documentation</DropdownMenuLabel>
              
              <DropdownMenuItem asChild>
                <Link href="/about" className="flex items-center gap-2 cursor-pointer">
                  <BookOpen className="h-4 w-4" />
                  About HeartVoice Monitor
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/clinical-science" className="flex items-center gap-2 cursor-pointer">
                  <Stethoscope className="h-4 w-4" />
                  Clinical Science
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/technical" className="flex items-center gap-2 cursor-pointer">
                  <Cpu className="h-4 w-4" />
                  Technical Documentation
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User info and actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {alertCount > 9 ? '9+' : alertCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <SettingsDialog 
            clinicianName={clinicianName}
            clinicianTitle={clinicianTitle}
          />

          {/* User profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{clinicianName}</p>
              <p className="text-xs text-muted-foreground">{clinicianTitle}</p>
            </div>
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}