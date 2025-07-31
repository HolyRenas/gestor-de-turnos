import React, { useState } from 'react';
import AlertTriangle from './icons/AlertTriangle';

export default function ModalManager({ scheduler }) {
  const {
    modal, setModal, ROLES, handleAddEmployee, handleRemoveEmployee,
    handleClearSchedule, executeAutoFill, shiftTypes, setShiftTypes,
    employees, setEmployees, dates, currentDate
  } = scheduler;

  if (!modal.type) return null;

  const closeModal = () => setModal({ type: null, data: null });

  const AddModal = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState(Object.keys(ROLES)[0]);
    return (
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Adicionar Novo Funcionário
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do funcionário"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          autoFocus
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-6 bg-white"
        >
          {Object.entries(ROLES).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex justify-end space-x-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleAddEmployee(name, role)}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Adicionar
          </button>
        </div>
      </div>
    );
  };
  const RemoveModal = () => (
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Confirmar Remoção
      </h3>
      <p className="text-gray-600 mb-6">
        Tem a certeza que deseja remover este funcionário?
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleRemoveEmployee}
          className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
        >
          Remover
        </button>
      </div>
    </div>
  );
  
  const ClearConfirmModal = () => (
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Limpar Horário</h3>
      <p className="text-gray-600 mb-6">
        Escolha uma opção para limpar o calendário.
      </p>
      <div className="flex flex-col space-y-3">
        <button 
          onClick={() => handleClearSchedule('auto', 'currentMonth', dates)} 
          className="px-4 py-2 w-full rounded-md bg-blue-500 text-white hover:bg-blue-600"
        >
          Limpar Automáticos (em {currentDate.toLocaleDateString('pt-PT', { month: 'long' })})
        </button>
        <button 
          onClick={() => handleClearSchedule('all', 'currentMonth', dates)} 
          className="px-4 py-2 w-full rounded-md bg-orange-500 text-white hover:bg-orange-600"
        >
          Limpar Tudo (em {currentDate.toLocaleDateString('pt-PT', { month: 'long' })})
        </button>
        <button 
          onClick={() => handleClearSchedule('all', 'allTime')} 
          className="px-4 py-2 w-full rounded-md bg-red-500 text-white hover:bg-red-600"
        >
          Limpar TODO o Histórico (Cuidado!)
        </button>
        <button 
          onClick={closeModal} 
          className="px-4 py-2 w-full rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 pt-3 mt-3 border-t"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  const AutoFillConfirmModal = () => (
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        Confirmar Preenchimento
      </h3>
      <p className="text-gray-600 mb-6">
        Isto irá substituir os turnos por preencher, respeitando as entradas
        manuais. Deseja continuar?
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={() =>
            executeAutoFill(modal.data.setIsAutoFilling, dates)
          }
          className="px-4 py-2 rounded-md bg-purple-500 text-white hover:bg-purple-600"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
  const AutoFillErrorModal = () => (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="text-red-500 mr-3 h-8 w-8" />
        <h3 className="text-lg font-bold text-gray-800">
          Erro de Preenchimento
        </h3>
      </div>
      <p className="text-gray-600 mb-6">{modal.data.message}</p>
      <div className="flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          OK
        </button>
      </div>
    </div>
  );
  const PdfLoadingErrorModal = () => (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="text-orange-500 mr-3 h-8 w-8" />
        <h3 className="text-lg font-bold text-gray-800">A Carregar</h3>
      </div>
      <p className="text-gray-600 mb-6">
        As bibliotecas para exportar PDF ainda estão a ser carregadas. Por
        favor, aguarde um momento e tente novamente.
      </p>
      <div className="flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          OK
        </button>
      </div>
    </div>
  );

  const SettingsModal = () => {
    const [localShiftTypes, setLocalShiftTypes] = useState(shiftTypes);
    const [localEmployees, setLocalEmployees] = useState(employees);
    const handleShiftTimeChange = (k, f, v) =>
      setLocalShiftTypes({
        ...localShiftTypes,
        [k]: { ...localShiftTypes[k], [f]: v },
      });
    const handleExclusionChange = (id, key) =>
      setLocalEmployees(
        localEmployees.map((e) =>
          e.id === id
            ? {
                ...e,
                excludedShifts: e.excludedShifts.includes(key)
                  ? e.excludedShifts.filter((s) => s !== key)
                  : [...e.excludedShifts, key],
              }
            : e,
        ),
      );
    const handleTargetHoursChange = (id, value) => {
      const hours = parseInt(value, 10);
      if (!isNaN(hours)) {
        setLocalEmployees(
          localEmployees.map((e) =>
            e.id === id ? { ...e, targetHours: hours } : e,
          ),
        );
      }
    };
    const handleSaveSettings = () => {
      setShiftTypes(localShiftTypes);
      setEmployees(localEmployees);
      closeModal();
    };
    return (
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Configurações</h3>
        <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
          Horários Gerais dos Turnos
        </h4>
        <div className="space-y-3 mb-8">
          {Object.entries(localShiftTypes)
            .filter(([k]) => k && !['F', 'FE'].includes(k))
            .map(([k, s]) => (
              <div key={k} className="grid grid-cols-3 items-center gap-4">
                <label className="font-medium text-gray-600">{s.label}</label>
                <input
                  type="time"
                  value={s.startTime}
                  onChange={(e) =>
                    handleShiftTimeChange(k, 'startTime', e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="time"
                  value={s.endTime}
                  onChange={(e) =>
                    handleShiftTimeChange(k, 'endTime', e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-md"
                />
              </div>
            ))}
        </div>
        <h4 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
          Configurações por Funcionário
        </h4>
        <div className="space-y-6">
          {localEmployees.map((e) => (
            <div key={e.id} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">
                {e.name}{' '}
                <span className="font-normal text-sm text-gray-500">
                  ({ROLES[e.role].label})
                </span>
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 items-center">
                <label className="font-medium text-gray-600 text-sm">
                  Horas Contratadas:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={e.targetHours}
                    onChange={(ev) =>
                      handleTargetHoursChange(e.id, ev.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-md w-24 text-center"
                  />
                </div>
                <label className="font-medium text-gray-600 text-sm">
                  Excluir Turnos:
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLES[e.role].allowedShifts
                    .filter((s) => s && !['F', 'FE'].includes(s))
                    .map((sk) => (
                      <button
                        key={sk}
                        onClick={() => handleExclusionChange(e.id, sk)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          e.excludedShifts.includes(sk)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {shiftTypes[sk].label}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  };
  
  const MODAL_COMPONENTS = {
    add: AddModal,
    remove: RemoveModal,
    autoFillConfirm: AutoFillConfirmModal,
    autoFillError: AutoFillErrorModal,
    settings: SettingsModal,
    clearConfirm: ClearConfirmModal,
    pdfLoadingError: PdfLoadingErrorModal,
  };

  const RenderedModal = MODAL_COMPONENTS[modal.type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {RenderedModal && <RenderedModal />}
      </div>
    </div>
  );
}