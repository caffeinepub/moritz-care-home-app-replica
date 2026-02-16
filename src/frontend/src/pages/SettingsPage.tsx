import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useGetAppSettings, useUpdateDisplayPreferences } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { DisplayPreferences, BackgroundMode } from '../backend';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: appSettings, isLoading, isFetched } = useGetAppSettings();
  const updatePreferences = useUpdateDisplayPreferences();

  const [showPrintProfileButton, setShowPrintProfileButton] = useState(true);
  const [editorBackgroundMode, setEditorBackgroundMode] = useState<BackgroundMode>(BackgroundMode.solidWhite);

  useEffect(() => {
    if (appSettings) {
      setShowPrintProfileButton(appSettings.displayPreferences.showPrintProfileButton);
      setEditorBackgroundMode(appSettings.displayPreferences.residentProfileEditorBackgroundMode);
    }
  }, [appSettings]);

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access settings</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!appSettings && isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load settings</p>
      </div>
    );
  }

  const hasChanges = appSettings && (
    showPrintProfileButton !== appSettings.displayPreferences.showPrintProfileButton ||
    editorBackgroundMode !== appSettings.displayPreferences.residentProfileEditorBackgroundMode
  );

  const handleSave = async () => {
    if (!appSettings) return;

    const updatedPreferences: DisplayPreferences = {
      showPrintProfileButton,
      residentProfileEditorBackgroundMode: editorBackgroundMode,
    };

    await updatePreferences.mutateAsync(updatedPreferences);
  };

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
                  checked={showPrintProfileButton}
                  onCheckedChange={setShowPrintProfileButton}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-0.5">
                  <Label htmlFor="editor-background" className="text-base font-medium">
                    Resident Profile Editor Background
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Choose the background color for resident profile editing screens
                  </p>
                </div>
                <Select
                  value={editorBackgroundMode}
                  onValueChange={(value) => setEditorBackgroundMode(value as BackgroundMode)}
                >
                  <SelectTrigger id="editor-background" className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BackgroundMode.solidWhite}>Solid White</SelectItem>
                    <SelectItem value={BackgroundMode.solidBlack}>Solid Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {hasChanges && (
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={updatePreferences.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updatePreferences.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
