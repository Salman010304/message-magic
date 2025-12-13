import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getStudentFinancials } from '@/hooks/useStudentFinancials';
import { StudentCard } from '@/components/StudentCard';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STANDARDS, MEDIUMS, BOARDS, MONTHS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function StudentsTab() {
  const {
    students,
    transactions,
    addStudent,
    updateStudent,
    editingStudent,
    setEditingStudent,
    setViewingStudent,
    setActiveTab
  } = useApp();
  
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'received'>('all');
  
  // Form state
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [std, setStd] = useState(STANDARDS[0]);
  const [medium, setMedium] = useState(MEDIUMS[0]);
  const [board, setBoard] = useState(BOARDS[0]);
  const [monthlyFee, setMonthlyFee] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [leaveDate, setLeaveDate] = useState('');
  
  // Populate form when editing
  React.useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setParentName(editingStudent.parentName || '');
      setPhone(editingStudent.phone || '');
      setSchool(editingStudent.school || '');
      setStd(editingStudent.std || STANDARDS[0]);
      setMedium(editingStudent.medium || MEDIUMS[0]);
      setBoard(editingStudent.board || BOARDS[0]);
      setMonthlyFee(editingStudent.monthlyFee.toString());
      setJoinDate(editingStudent.joinDate);
      setLeaveDate(editingStudent.leaveDate || '');
    }
  }, [editingStudent]);
  
  const resetForm = () => {
    setName('');
    setParentName('');
    setPhone('');
    setSchool('');
    setStd(STANDARDS[0]);
    setMedium(MEDIUMS[0]);
    setBoard(BOARDS[0]);
    setMonthlyFee('');
    setJoinDate('');
    setLeaveDate('');
    setEditingStudent(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !monthlyFee || !joinDate) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    const studentData = {
      id: editingStudent?.id || Date.now().toString(),
      name,
      parentName,
      phone,
      school,
      std,
      medium,
      board,
      monthlyFee: parseFloat(monthlyFee),
      joinDate,
      leaveDate: leaveDate || null,
      active: !leaveDate
    };
    
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData);
      toast({
        title: 'Student Updated',
        description: `${name}'s details have been updated.`
      });
    } else {
      addStudent(studentData);
      toast({
        title: 'Student Added',
        description: `${name} has been added to the class.`
      });
    }
    
    resetForm();
  };
  
  // Unique schools for autocomplete
  const uniqueSchools = useMemo(() => {
    const schools = students.map(s => s.school).filter(Boolean);
    return [...new Set(schools)];
  }, [students]);
  
  // Stats
  const stats = useMemo(() => {
    let totalReceived = 0;
    let totalPending = 0;
    
    students.forEach(student => {
      const fin = getStudentFinancials(student, transactions);
      totalReceived += fin.paid;
      totalPending += fin.pending;
    });
    
    return { totalStudents: students.length, totalReceived, totalPending };
  }, [students, transactions]);
  
  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterType === 'all') return true;
      const fin = getStudentFinancials(s, transactions);
      if (filterType === 'pending') return fin.pending > 0;
      if (filterType === 'received') return fin.status === 'Paid' || fin.status === 'Advance';
      return true;
    });
  }, [students, transactions, filterType]);
  
  const handleQuickPay = (student: typeof students[0]) => {
    // Pre-fill and navigate to add tab
    setActiveTab('add');
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setFilterType('all')}
          className={cn(
            'p-5 rounded-2xl text-center transition-all duration-200 border-2',
            filterType === 'all'
              ? 'bg-primary/10 border-primary'
              : 'bg-card border-border hover:border-primary/50'
          )}
        >
          <p className="text-xs text-primary font-bold tracking-widest uppercase mb-1">
            Total Students
          </p>
          <p className="text-3xl font-extrabold text-foreground">
            {stats.totalStudents}
          </p>
        </button>
        
        <button
          onClick={() => setFilterType('received')}
          className={cn(
            'p-5 rounded-2xl text-center transition-all duration-200 border-2',
            filterType === 'received'
              ? 'bg-income/10 border-income'
              : 'bg-card border-border hover:border-income/50'
          )}
        >
          <p className="text-xs text-income font-bold tracking-widest uppercase mb-1">
            Total Received
          </p>
          <p className="text-3xl font-extrabold text-foreground">
            ₹{stats.totalReceived.toLocaleString('en-IN')}
          </p>
        </button>
        
        <button
          onClick={() => setFilterType('pending')}
          className={cn(
            'p-5 rounded-2xl text-center transition-all duration-200 border-2',
            filterType === 'pending'
              ? 'bg-expense/10 border-expense'
              : 'bg-card border-border hover:border-expense/50'
          )}
        >
          <p className="text-xs text-expense font-bold tracking-widest uppercase mb-1">
            Total Pending
          </p>
          <p className="text-3xl font-extrabold text-foreground">
            ₹{stats.totalPending.toLocaleString('en-IN')}
          </p>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Icons.Users className="w-5 h-5 text-primary" />
              Student Directory
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
            >
              <Icons.Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                <Icons.Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No students found</p>
                <p className="text-sm">Add your first student to get started</p>
              </div>
            ) : (
              filteredStudents.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onView={() => setViewingStudent(student)}
                  onQuickPay={() => handleQuickPay(student)}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-card sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-foreground">
                {editingStudent ? 'Edit Student' : 'Register Student'}
              </h3>
              {editingStudent && (
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Student Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Enter parent name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Enter school name"
                  list="schools"
                />
                <datalist id="schools">
                  {uniqueSchools.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label>Standard</Label>
                  <Select value={std} onValueChange={setStd}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STANDARDS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <Select value={medium} onValueChange={setMedium}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIUMS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Select value={board} onValueChange={setBoard}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARDS.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="fee">Monthly Fee *</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    placeholder="₹0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date *</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leaveDate" className="text-destructive">
                  Leave Date (if applicable)
                </Label>
                <Input
                  id="leaveDate"
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="border-destructive/30 focus:border-destructive"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
                {editingStudent && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
