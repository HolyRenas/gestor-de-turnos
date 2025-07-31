import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useScheduler } from './hooks/useScheduler';
import ModalManager from './components/ModalManager';
import EditableEmployeeName from './components/EditableEmployeeName';
import Trash2 from './components/icons/Trash2';
import ChevronLeft from './components/icons/ChevronLeft';
import ChevronRight from './components/icons/ChevronRight';
import Wand2 from './components/icons/Wand2';
import Settings from './components/icons/Settings';
import Broom from './components/icons/Broom';
import FileDown from './components/icons/FileDown';
import Loader from './components/icons/Loader';
import UserPlus from './components/icons/UserPlus';

export default function App() {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  const scheduler = useScheduler();
  const {
    employees, shiftTypes, currentDate,
    ROLES, handlePrevMonth, handleNextMonth, handleToday, handleEditEmployeeName,
    handleShiftChange, setModal, handleAutoFillClick, calculateDailyTotals,
    calculateEmployeeTotals,
  } = scheduler;
  
  const scheduleRef = useRef(null);
  
  const dates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month, i + 1);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return {
            date: i + 1,
            dayOfWeek: date.toLocaleDateString('pt-PT', { weekday: 'short' }).slice(0, 3),
            fullDate: `${yyyy}-${mm}-${dd}`
        };
    });
  }, [currentDate]);

  const dailyTotals = useMemo(() => 
    calculateDailyTotals(dates, employees), 
    [dates, employees, calculateDailyTotals]
  );
  
  const employeeTotals = useMemo(() => 
    calculateEmployeeTotals(employees, dates),
    [employees, dates, calculateEmployeeTotals]
  );

  const isWeekend = (fullDateString) => {
    const dayOfWeek = new Date(fullDateString).getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };
  
  useEffect(() => {
    const loadScript = (src, id) => {
      if (!document.getElementById(id)) {
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        document.head.appendChild(script);
      }
    };
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf-script');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'html2canvas-script');
  }, []);

  const handleExportPDF = () => {
    const scheduleElement = scheduleRef.current;
    if (!scheduleElement) return;

    if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
        setModal({ type: 'pdfLoadingError', data: null });
        return;
    }
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    const actionButtons = scheduleElement.querySelectorAll('.action-button');
    actionButtons.forEach(btn => btn.style.visibility = 'hidden');

    html2canvas(scheduleElement, { scale: 2 }).then(canvas => {
      actionButtons.forEach(btn => btn.style.visibility = 'visible');

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 277; 
      const pageHeight = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // O TÍTULO FOI REMOVIDO DAQUI

      let position = 10; // Posição Y inicial da imagem, perto do topo
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `horario_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.pdf`;
      pdf.save(fileName);
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="p-4 sm:p-6 lg:p-8">
        <ModalManager scheduler={{...scheduler, dates, currentDate}} />
        <div ref={scheduleRef} className="max-w-full mx-auto bg-white rounded-2xl shadow-lg">
          <header className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-800">Planeamento de Turnos</h1>
              <p className="text-gray-500">Gestão de equipa por função</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
              <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronLeft /></button>
              <button onClick={handleToday} className="p-2 rounded-md hover:bg-gray-200 transition-colors text-lg font-semibold text-gray-700 w-48 text-center">{currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</button>
              <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronRight /></button>
            </div>
            <div className="flex items-center gap-2 action-button">
              <button onClick={handleExportPDF} title="Exportar para PDF" className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-sm"><FileDown /></button>
              <button onClick={() => setModal({ type: 'settings', data: null })} title="Configurações" className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-sm"><Settings /></button>
              <button onClick={() => setModal({ type: 'clearConfirm' })} title="Limpar horário" className="p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all shadow-sm"><Broom /></button>
              <button
                onClick={() => handleAutoFillClick(setIsAutoFilling, dates)}
                disabled={isAutoFilling}
                title="Preencher automaticamente o horário"
                className="flex items-center justify-center w-36 space-x-2 bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-600 transition-all shadow-sm disabled:bg-purple-400 disabled:cursor-not-allowed"
              >
                {isAutoFilling ? (<><Loader /><span>Aguarde...</span></>) : (<><Wand2 /><span>Preencher</span></>)}
              </button>
              <button onClick={() => setModal({ type: 'add', data: null })} className="flex items-center space-x-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all shadow-sm"><UserPlus /><span>Adicionar</span></button>
            </div>
          </header>

          <div className="p-4 flex flex-wrap justify-center items-center gap-4 border-b border-gray-200 bg-gray-50">
              <span className="font-semibold text-gray-600">Legenda:</span>
              {Object.entries(shiftTypes).filter(([key]) => key).map(([key, { label, color, textColor }]) => (<div key={key} className={`px-3 py-1 text-sm font-medium rounded-full ${color} ${textColor}`}>{key}: {label}</div>))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 font-bold sticky left-0 bg-gray-50 z-20 min-w-[250px]">Funcionário</th>
                  {dates.map(({ date, dayOfWeek, fullDate }) => (<th key={fullDate} scope="col" className={`px-2 py-3 text-center w-16 ${isWeekend(fullDate) ? 'bg-gray-100' : ''}`}><div>{dayOfWeek}</div><div className="font-extrabold text-lg">{date}</div></th>))}
                  <th scope="col" className="px-2 py-3 text-center font-bold sticky right-0 bg-gray-50 z-20 min-w-[200px]">Totais (Turnos / Horas)</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, empIndex) => (
                  <tr key={employee.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 sticky left-0 bg-white hover:bg-gray-50 z-10 flex items-center justify-between min-w-[250px]">
                      <div><EditableEmployeeName id={employee.id} name={employee.name} onSave={handleEditEmployeeName} /><span className={`text-xs px-2 py-0.5 rounded-full ${ROLES[employee.role]?.color || ''}`}>{ROLES[employee.role]?.label || 'Sem função'}</span></div>
                      <button onClick={() => setModal({ type: 'remove', data: { id: employee.id } })} className="text-gray-400 hover:text-red-500 ml-4 opacity-50 hover:opacity-100 transition-opacity action-button"><Trash2 /></button>
                    </td>
                    {dates.map(({ fullDate }) => {
                      const shiftData = employee.shifts[fullDate];
                      const shiftKey = shiftData?.shift || '';
                      const shiftInfo = shiftTypes[shiftKey] || shiftTypes[''];
                      const allowedShifts = ['', ...ROLES[employee.role]?.allowedShifts || []];
                      return(<td key={fullDate} className={`p-1 ${isWeekend(fullDate) ? 'bg-gray-100' : ''}`}><select value={shiftKey} onChange={(e) => handleShiftChange(employee.id, fullDate, e.target.value)} className={`w-full p-2 h-10 border-0 rounded-md text-center font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${shiftInfo.color} ${shiftInfo.textColor}`}>{allowedShifts.map(key => (<option key={key} value={key}>{key}</option>))}</select></td>)
                    })}
                    <td className="px-4 py-4 sticky right-0 bg-white hover:bg-gray-50 z-10 min-w-[200px]">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                        {employeeTotals[empIndex] && Object.keys(shiftTypes).filter(s => s).map(s => (<span key={s} className="text-xs font-mono">{s}:<span className="font-bold">{employeeTotals[empIndex][s]}</span></span>))}
                        <span className="text-xs font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{employeeTotals[empIndex]?.totalHours || 0}h</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold text-gray-800 sticky bottom-0 z-10">
                  <tr>
                      <td className="px-6 py-3 sticky left-0 bg-gray-100 z-20">Total Diário</td>
                      {dailyTotals.map((total, index) => {
                          const displayOrder = ['M', 'T', 'N', 'E', 'L'];
                          return (
                              <td key={index} className="px-1 py-2 text-center">
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    {displayOrder.map(shiftKey => {
                                      const value = total[shiftKey] || 0;
                                      const displayInfo = shiftTypes[shiftKey];
                                      if (!displayInfo) return null;
                                      return ( <div key={shiftKey} title={displayInfo.label} className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-mono ${displayInfo.color} ${value === 0 ? 'invisible' : ''}`} > {shiftKey}:{value} </div> )
                                    })}
                                  </div>
                              </td>
                          );
                      })}
                      <td className="sticky right-0 bg-gray-100 z-20"></td>
                  </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Criado com React e Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
}