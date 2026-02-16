import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { useAddResponsibleContact } from '../../../hooks/useQueries';
import type { ResponsibleContact } from '../../../backend';

export default function ResponsiblePersonAddPage() {
  const { residentId } = useParams({ from: '/resident/$residentId/responsible-persons/add' });
  const navigate = useNavigate();
  const addContact = useAddResponsibleContact();

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData: ResponsibleContact = {
      id: 0n,
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      email: formData.email,
      isPrimary: formData.isPrimary,
    };

    await addContact.mutateAsync({
      residentId: BigInt(residentId),
      contact: contactData,
    });

    navigate({ to: `/resident/${residentId}` });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: `/resident/${residentId}` })} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resident Profile
        </Button>

        <Card className="max-w-2xl mx-auto bg-white">
          <CardHeader>
            <CardTitle>Add Responsible Person</CardTitle>
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
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
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
                <Label htmlFor="email">Email (Fax) *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked as boolean })}
                />
                <Label htmlFor="isPrimary" className="cursor-pointer">
                  Set as Primary Contact
                </Label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: `/resident/${residentId}` })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addContact.isPending}>
                  {addContact.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
