import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserProfile } from '../backend';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [showResidentProfileReport, setShowResidentProfileReport] = useState(true);

  useEffect(() => {
    if (userProfile) {
      setShowResidentProfileReport(userProfile.showResidentProfileReport ?? true);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      showResidentProfileReport,
    };

    await saveProfile.mutateAsync(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!userProfile && isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load settings</p>
      </div>
    );
  }

  const hasChanges = userProfile && showResidentProfileReport !== (userProfile.showResidentProfileReport ?? true);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your application preferences</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Control what information is visible in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-report" className="text-base font-medium">
                    Resident Profile Report
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show the print profile button and report on resident profile pages
                  </p>
                </div>
                <Switch
                  id="show-report"
                  checked={showResidentProfileReport}
                  onCheckedChange={setShowResidentProfileReport}
                />
              </div>
            </CardContent>
          </Card>

          {hasChanges && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saveProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
