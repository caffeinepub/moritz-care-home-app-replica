import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAddPhysician } from '../../../hooks/useQueries';
import type { Physician } from '../../../backend';
import ResidentProfileEditorSurface from '../../../components/resident-profile/ResidentProfileEditorSurface';

export default function PhysicianAddPage() {
  const { residentId } = useParams({ from: '/resident/$residentId/physicians/add' });
  const navigate = useNavigate();
  const addPhysician = useAddPhysician();

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    contactInfo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const physicianData: Physician = {
      id: 0n,
      name: formData.name,
      specialty: formData.specialty,
      contactInfo: formData.contactInfo,
    };

    await addPhysician.mutateAsync({
      residentId: BigInt(residentId),
      physician: physicianData,
    });

    navigate({ to: `/resident/${residentId}` });
  };

  return (
    <ResidentProfileEditorSurface className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: `/resident/${residentId}` })} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resident Profile
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Add Physician</CardTitle>
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
                <Button type="submit" disabled={addPhysician.isPending}>
                  {addPhysician.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResidentProfileEditorSurface>
  );
}
