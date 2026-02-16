import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit } from 'lucide-react';
import type { Resident } from '../../../backend';

interface InsuranceInformationSectionProps {
  resident: Resident;
  canEdit: boolean;
}

export default function InsuranceInformationSection({ resident, canEdit }: InsuranceInformationSectionProps) {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate({ to: `/resident/${resident.id}/insurance/add` });
  };

  const handleEdit = (insuranceId: bigint) => {
    navigate({ to: `/resident/${resident.id}/insurance/${insuranceId}/edit` });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Insurance Information</CardTitle>
          {canEdit && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Insurance
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {resident.insuranceInfos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No insurance information</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insurance Name</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Medicare ID</TableHead>
                <TableHead>Medicaid ID</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resident.insuranceInfos.map((insurance) => (
                <TableRow key={insurance.id.toString()}>
                  <TableCell className="font-medium">{insurance.provider}</TableCell>
                  <TableCell>{insurance.policyNumber}</TableCell>
                  <TableCell>{insurance.medicareNumber || '—'}</TableCell>
                  <TableCell>{insurance.medicaidNumber || '—'}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(insurance.id)}>
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
