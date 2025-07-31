import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { initialShiftTypes, ROLES, initialEmployees } from '../constants/config';

export const useScheduler = () => {
  const [employees, setEmployees] = useState(() => {
    try {
      const savedEmployees = localStorage.getItem('scheduler_employees');
      const parsed = savedEmployees ? JSON.parse(savedEmployees) : initialEmployees;
      return parsed.map(emp => ({ ...emp, targetHours: emp.targetHours || 160 }));
    } catch (error) { return initialEmployees; }
  });

  const [shiftTypes, setShiftTypes] = useState(() => {
    try {
      const savedShiftTypes = localStorage.getItem('scheduler_shiftTypes');
      return savedShiftTypes ? JSON.parse(savedShiftTypes) : initialShiftTypes;
    } catch (error) { return initialShiftTypes; }
  });

  const sortedEmployees = useMemo(() => {
    const roleOrder = { 'AUXILIAR': 1, 'ENCARREGADA': 2, 'LIMPEZA': 3 };
    const employeesToSort = [...employees];
    employeesToSort.sort((a, b) => {
      const orderA = roleOrder[a.role] || 99;
      const orderB = roleOrder[b.role] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
    return employeesToSort;
  }, [employees]);

  useEffect(() => { localStorage.setItem('scheduler_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('scheduler_shiftTypes', JSON.stringify(shiftTypes)); }, [shiftTypes]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState({ type: null, data: null });

  const getShiftDuration = useCallback((shiftKey) => {
    const shift = shiftTypes[shiftKey];
    if (!shift || !shift.startTime || !shift.endTime) return 0;
    const start = new Date(`1970-01-01T${shift.startTime}:00`);
    let end = new Date(`1970-01-01T${shift.endTime}:00`);
    if (end <= start) end.setDate(end.getDate() + 1);
    return (end - start) / (1000 * 60 * 60);
  }, [shiftTypes]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());
  
  const handleAddEmployee = (name, role) => {
    if (name && role) {
      const newEmployee = { id: Date.now(), name, role, shifts: {}, excludedShifts: [], targetHours: 160 };
      setEmployees([...employees, newEmployee]);
      setModal({ type: null, data: null });
      toast.success('Funcionário adicionado com sucesso!');
    } else { toast.error('Por favor, preencha o nome e a função.'); }
  };
  const handleRemoveEmployee = () => {
    if (modal.data?.id) {
      setEmployees(employees.filter(emp => emp.id !== modal.data.id));
      setModal({ type: null, data: null });
      toast.success('Funcionário removido.');
    }
  };
  const handleEditEmployeeName = (id, newName) => {
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, name: newName } : emp));
      toast.success('Nome atualizado!');
  };
  const handleShiftChange = (employeeId, date, shiftKey) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        const newShifts = { ...emp.shifts };
        if (shiftKey) {
          newShifts[date] = { shift: shiftKey, source: 'manual' };
        } else {
          delete newShifts[date];
        }
        return { ...emp, shifts: newShifts };
      }
      return emp;
    }));
  };
  const handleClearSchedule = (mode, scope, datesInMonth) => {
    setEmployees(employees.map(emp => {
      if (scope === 'allTime') {
        if (mode === 'all') return { ...emp, shifts: {} };
        const newShifts = {};
        Object.entries(emp.shifts).forEach(([date, shiftData]) => {
          if (shiftData?.source === 'manual') newShifts[date] = shiftData;
        });
        return { ...emp, shifts: newShifts };
      }
      if (scope === 'currentMonth') {
        const currentMonthDates = new Set(datesInMonth.map(d => d.fullDate));
        const newShifts = {};
        Object.entries(emp.shifts).forEach(([date, shiftData]) => {
          if (!currentMonthDates.has(date)) { newShifts[date] = shiftData; return; }
          if (mode === 'auto' && shiftData?.source === 'manual') { newShifts[date] = shiftData; }
        });
        return { ...emp, shifts: newShifts };
      }
      return emp;
    }));
    setModal({ type: null, data: null });
    toast.success('Horário limpo com sucesso!');
  };

  const executeAutoFill = (setIsAutoFilling, dates) => {
    // Este é o algoritmo estável que funciona para Auxiliares e Encarregadas
    setModal({ type: null, data: null });
    setIsAutoFilling(true);

    setTimeout(() => {
        let schedulerData = {};
        const allEmployees = [...employees];

        allEmployees.forEach(emp => {
            schedulerData[emp.id] = {
                shifts: { ...emp.shifts }, monthlyHours: 0, consecutiveWork: 0,
                stintLength: 0, stintType: null,
            };
            Object.entries(emp.shifts).forEach(([date, shiftData]) => {
                if(shiftData?.source === 'manual' && dates.some(d => d.fullDate === date)) {
                    schedulerData[emp.id].monthlyHours += getShiftDuration(shiftData.shift);
                }
            });
        });
        
        const getRestHours = (prevShiftKey, nextShiftKey) => {
            const prev = shiftTypes[prevShiftKey], next = shiftTypes[nextShiftKey];
            if (!prev || !next || !prev.endTime || !prev.startTime) return Infinity;
            let prevEnd = new Date(`1970-01-01T${prev.endTime}:00`); if (prev.endTime < prev.startTime) prevEnd.setDate(prevEnd.getDate() + 1);
            let nextStart = new Date(`1970-01-02T${next.startTime}:00`);
            if (nextStart < prevEnd) nextStart.setDate(nextStart.getDate() + 1);
            return (nextStart - prevEnd) / (1000 * 60 * 60);
        };

        const shiftsToFillConfig = {
            ENCARREGADA: [{ shift: 'E', count: 1 }],
            LIMPEZA: [{ shift: 'L', count: 1 }],
            AUXILIAR: [{ shift: 'M', count: 2 }, { shift: 'T', count: 2 }, { shift: 'N', count: 1 }]
        };

        dates.forEach((date, dayIndex) => {
            const prevDate = dayIndex > 0 ? dates[dayIndex - 1].fullDate : null;
            
            Object.entries(shiftsToFillConfig).forEach(([role, shiftsInRole]) => {
                shiftsInRole.forEach(({ shift, count }) => {
                    const employeePool = allEmployees.filter(e => e.role === role);
                    let availablePool = [...employeePool];
                    for (let i = 0; i < count; i++) {
                        const eligible = availablePool.filter(e => {
                            const data = schedulerData[e.id];
                            const prevShift = prevDate ? data.shifts[prevDate]?.shift : null;
                            const duration = getShiftDuration(shift);
                            
                            return !data.shifts[date.fullDate] && 
                                   (data.monthlyHours + duration) <= (e.targetHours || 160) * 1.15 &&
                                   !e.excludedShifts.includes(shift) && 
                                   getRestHours(prevShift, shift) >= 10 &&
                                   data.consecutiveWork < 5;
                        });
                        
                        if (eligible.length === 0) { console.error(`CRITICAL: No eligible candidates for ${shift} on ${date.fullDate}`); continue; }

                        eligible.sort((a, b) => {
                            const dataA = schedulerData[a.id];
                            const dataB = schedulerData[b.id];
                            
                            const aContinues = dataA.stintType === shift && dataA.stintLength < 3;
                            const bContinues = dataB.stintType === shift && dataB.stintLength < 3;
                            if (aContinues !== bContinues) return aContinues ? -1 : 1;
                           
                            const aNeedsRest = dataA.stintLength >= 3;
                            const bNeedsRest = dataB.stintLength >= 3;
                            if(aNeedsRest !== bNeedsRest) return aNeedsRest ? 1 : -1;
                           
                            if (dataA.consecutiveWork !== dataB.consecutiveWork) return dataA.consecutiveWork - dataB.consecutiveWork;
                            
                            return dataA.monthlyHours - dataB.monthlyHours;
                        });

                        const bestCandidate = eligible[0];
                        schedulerData[bestCandidate.id].shifts[date.fullDate] = { shift, source: 'auto' };
                        availablePool = availablePool.filter(e => e.id !== bestCandidate.id);
                    }
                });
            });

            allEmployees.forEach(emp => {
                const data = schedulerData[emp.id];
                if (!data.shifts[date.fullDate]) { data.shifts[date.fullDate] = { shift: 'F', source: 'auto' }; }
                
                const finalShiftData = data.shifts[date.fullDate];
                const finalShift = finalShiftData.shift;
                const prevShiftData = prevDate ? schedulerData[emp.id].shifts[prevDate] : null;
                const prevShift = prevShiftData?.shift;
                
                if (finalShift && finalShift !== 'F' && finalShift !== 'FE') {
                    data.consecutiveWork = (prevShift && prevShift !== 'F' && prevShift !== 'FE') ? (data.consecutiveWork || 0) + 1 : 1;
                    if(finalShiftData.source === 'auto') {
                        data.monthlyHours += getShiftDuration(finalShift);
                    }
                    if (finalShift === data.stintType) { data.stintLength++; } else { data.stintLength = 1; data.stintType = finalShift; }
                } else {
                    data.consecutiveWork = 0;
                    data.stintLength = 0;
                    data.stintType = null;
                }
            });
        });
        
        setEmployees(employees.map(emp => ({ ...emp, shifts: { ...emp.shifts, ...schedulerData[emp.id].shifts } })));
        setIsAutoFilling(false);
        toast.success('Horário preenchido automaticamente!');
    }, 50);
  };
  
  const handleAutoFillClick = (setIsAutoFilling, dates) => {
    const auxiliares = employees.filter(e => e.role === 'AUXILIAR');
    if (auxiliares.length < 5) { 
        setModal({ type: 'autoFillError', data: { message: "São necessários pelo menos 5 auxiliares." }}); return;
    }
    setModal({ type: 'autoFillConfirm', data: { setIsAutoFilling, dates } });
  };

  const calculateEmployeeTotals = (employeesToCalc, datesInMonth) => {
    if (!employeesToCalc || !datesInMonth) return [];
    return employeesToCalc.map(emp => {
      const totals = Object.keys(shiftTypes).reduce((acc, shift) => { if(shift) acc[shift] = 0; return acc; }, {});
      let totalHours = 0;
      datesInMonth.forEach(date => {
        const shiftData = emp.shifts[date.fullDate];
        if (shiftData?.shift && totals[shiftData.shift] !== undefined) {
          totals[shiftData.shift]++;
          totalHours += getShiftDuration(shiftData.shift);
        }
      });
      return { ...totals, totalHours: Math.round(totalHours) };
    });
  };

  const calculateDailyTotals = (dates, employeesToCalc) => {
    if (!dates) return [];
    return dates.map(d => {
        const totals = { M: 0, T: 0, N: 0, E: 0, L: 0 };
        employeesToCalc.forEach(emp => { const shift = emp.shifts[d.fullDate]?.shift; if (totals[shift] !== undefined) totals[shift]++; });
        return totals;
    });
  };

  return {
    employees: sortedEmployees, setEmployees, shiftTypes, setShiftTypes, currentDate, modal, setModal,
    calculateEmployeeTotals, 
    calculateDailyTotals, ROLES, handlePrevMonth, handleNextMonth, handleToday, handleAddEmployee,
    handleRemoveEmployee, handleEditEmployeeName, handleShiftChange, handleClearSchedule, executeAutoFill, handleAutoFillClick
  };
};