import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useAddPharmacyInfo } from '../../../hooks/useQueries';
import type { PharmacyInfo } from '../../../backend';
import ResidentProfileEditorSurface from '../../../components/resident-profile/ResidentProfileEditorSurface';

export default function PharmacyAddPage() {
  const { residentId } = useParams({ from: '/resident/$residentId/pharmacy/add' });
  const navigate = useNavigate();
  const addPharmacy = useAddPharmacyInfo();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    fax: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pharmacyData: PharmacyInfo = {
      id: 0n,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      fax: formData.fax,
    };

    await addPharmacy.mutateAsync({
      residentId: BigInt(residentId),
      pharmacy: pharmacyData,
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
            <CardTitle>Add Pharmacy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Pharmacy Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax">Fax Number *</Label>
                <Input
                  id="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: `/resident/${residentId}` })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addPharmacy.isPending}>
                  {addPharmacy.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResidentProfileEditorSurface>
  );
}
