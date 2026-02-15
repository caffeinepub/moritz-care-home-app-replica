import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { UserProfile, UserType } from '../../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>(UserType.staff);
  const [relatedResidentIds, setRelatedResidentIds] = useState('');
  
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const relatedIds = relatedResidentIds
      .split(',')
      .map(id => id.trim())
      .filter(id => id)
      .map(id => BigInt(id));

    const profile: UserProfile = {
      name: name.trim(),
      userType: userType,
      relatedResidentIds: relatedIds,
      showResidentProfileReport: true,
    };

    await saveProfile.mutateAsync(profile);
  };

  const showRelatedResidents = userType === UserType.resident || userType === UserType.familyMember;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md dialog-solid-white" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Moritz Care Home</DialogTitle>
          <DialogDescription>
            Please complete your profile to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="userType">Role *</Label>
            <Select value={userType} onValueChange={(value: UserType) => setUserType(value)}>
              <SelectTrigger id="userType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserType.staff}>Staff/Caregiver</SelectItem>
                <SelectItem value={UserType.resident}>Resident</SelectItem>
                <SelectItem value={UserType.familyMember}>Family Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showRelatedResidents && (
            <div>
              <Label htmlFor="relatedResidentIds">Related Resident IDs</Label>
              <Input
                id="relatedResidentIds"
                value={relatedResidentIds}
                onChange={(e) => setRelatedResidentIds(e.target.value)}
                placeholder="e.g., 1, 2, 3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated list of resident IDs you can access
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Saving...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
