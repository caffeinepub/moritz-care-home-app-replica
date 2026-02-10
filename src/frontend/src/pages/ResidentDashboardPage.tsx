import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetResidentStats, useGetAccessibleResidents, useDischargeResident, useDeleteResident, useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, UserX, Eye, UserMinus, Trash2, Plus, Filter, ArrowUpDown } from 'lucide-react';
import AddNewResidentModal from '../components/residents/modals/AddNewResidentModal';
import { isStaffOrAdmin, canListAllResidents } from '../lib/auth/helpers';
import { ResidentStatus } from '../backend';

export default function ResidentDashboardPage() {
  const navigate = useNavigate();
  const { data: stats } = useGetResidentStats();
  const { data: residents = [] } = useGetAccessibleResidents();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const dischargeResident = useDischargeResident();
  const deleteResident = useDeleteResident();

  const [showAddModal, setShowAddModal] = useState(false);
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'discharged'>('all');
  const [sortBy, setSortBy] = useState<'room' | 'name'>('room');

  const canWrite = isStaffOrAdmin(userProfile, isAdmin);
  const canViewStats = canListAllResidents(userProfile, isAdmin);

  const uniqueRooms = useMemo(() => {
    const rooms = new Set(residents.map(r => r.roomNumber));
    return Array.from(rooms).sort();
  }, [residents]);

  const filteredAndSortedResidents = useMemo(() => {
    let filtered = residents;

    if (roomFilter !== 'all') {
      filtered = filtered.filter(r => r.roomNumber === roomFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => {
        const status = r.status;
        return status === statusFilter;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'room') {
        const roomCompare = a.roomNumber.localeCompare(b.roomNumber);
        if (roomCompare !== 0) return roomCompare;
        return a.bed.localeCompare(b.bed);
      } else {
        return a.lastName.localeCompare(b.lastName);
      }
    });

    return sorted;
  }, [residents, roomFilter, statusFilter, sortBy]);

  const handleDischarge = async (residentId: bigint) => {
    if (confirm('Are you sure you want to discharge this resident?')) {
      await dischargeResident.mutateAsync(residentId);
    }
  };

  const handleDelete = async (residentId: bigint) => {
    if (confirm('Are you sure you want to delete this resident? This action cannot be undone.')) {
      await deleteResident.mutateAsync(residentId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Resident Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor all residents</p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Add New Resident
          </Button>
        )}
      </div>

      {canViewStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-teal-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Residents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">{stats?.totalResidents.toString() || '0'}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Active Residents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.activeResidents.toString() || '0'}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Discharged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats?.dischargedResidents.toString() || '0'}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Room:</span>
              <Select value={roomFilter} onValueChange={setRoomFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {uniqueRooms.map(room => (
                    <SelectItem key={room} value={room}>Room {room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room">Room Number & Bed</SelectItem>
                  <SelectItem value="name">Last Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">
                <Users className="w-4 h-4 mr-2" />
                All
              </TabsTrigger>
              <TabsTrigger value="active">
                <UserCheck className="w-4 h-4 mr-2" />
                Active
              </TabsTrigger>
              <TabsTrigger value="discharged">
                <UserX className="w-4 h-4 mr-2" />
                Discharged
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedResidents.map(resident => {
              const isActive = resident.status === ResidentStatus.active;
              const age = new Date().getFullYear() - new Date(resident.dob).getFullYear();

              return (
                <Card key={resident.id.toString()} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {resident.firstName} {resident.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Age: {age} years • ID: {resident.id.toString()}
                        </p>
                      </div>
                      <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                        {isActive ? 'Active' : 'Discharged'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Room {resident.roomNumber} - {resident.roomType} ({resident.bed})
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Physicians</span>
                      <span className="font-semibold text-gray-900">{resident.physicians.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Medications</span>
                      <span className="font-semibold text-gray-900">{resident.medications.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate({ to: '/resident/$residentId', params: { residentId: resident.id.toString() } })}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      {canWrite && isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDischarge(resident.id)}
                          disabled={dischargeResident.isPending}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Discharge
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDelete(resident.id)}
                          disabled={deleteResident.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAndSortedResidents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No residents found matching the current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && <AddNewResidentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
