import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useGetResident, useUpdatePhysician } from '../../../hooks/useQueries';
import type { Physician } from '../../../backend';

export default function PhysicianEditPage() {
  const { residentId, physicianId } = useParams({ from: '/resident/$residentId/physicians/$physicianId/edit' });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const updatePhysician = useUpdatePhysician();

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    contactInfo: '',
  });

  useEffect(() => {
    if (resident) {
      const physician = resident.physicians.find((p) => p.id.toString() === physicianId);
      if (physician) {
        setFormData({
          name: physician.name,
          specialty: physician.specialty,
          contactInfo: physician.contactInfo,
        });
      }
    }
  }, [resident, physicianId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const physicianData: Physician = {
      id: BigInt(physicianId),
      name: formData.name,
      specialty: formData.specialty,
      contactInfo: formData.contactInfo,
    };

    await updatePhysician.mutateAsync({
      residentId: BigInt(residentId),
      physicianId: BigInt(physicianId),
      updatedPhysician: physicianData,
    });

    navigate({ to: `/resident/${residentId}` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: `/resident/${residentId}` })} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resident Profile
        </Button>

        <Card className="max-w-2xl mx-auto bg-white">
          <CardHeader>
            <CardTitle>Edit Physician</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty *</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Info *</Label>
                <Input
                  id="contactInfo"
                  type="tel"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: `/resident/${residentId}` })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePhysician.isPending}>
                  {updatePhysician.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
