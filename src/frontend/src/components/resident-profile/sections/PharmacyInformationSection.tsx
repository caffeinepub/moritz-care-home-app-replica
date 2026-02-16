import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Phone } from 'lucide-react';
import type { Resident } from '../../../backend';

interface PharmacyInformationSectionProps {
  resident: Resident;
  canEdit: boolean;
}

export default function PharmacyInformationSection({ resident, canEdit }: PharmacyInformationSectionProps) {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate({ to: `/resident/${resident.id}/pharmacy/add` });
  };

  const handleEdit = (pharmacyId: bigint) => {
    navigate({ to: `/resident/${resident.id}/pharmacy/${pharmacyId}/edit` });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pharmacy Information</CardTitle>
          {canEdit && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Pharmacy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {resident.pharmacyInfos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pharmacy information</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pharmacy Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Fax</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resident.pharmacyInfos.map((pharmacy) => (
                <TableRow key={pharmacy.id.toString()}>
                  <TableCell className="font-medium">{pharmacy.name}</TableCell>
                  <TableCell>{pharmacy.address}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {pharmacy.phone}
                    </div>
                  </TableCell>
                  <TableCell>{pharmacy.fax}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(pharmacy.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
