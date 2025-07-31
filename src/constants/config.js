// src/constants/config.js

export const initialShiftTypes = {
  '': { label: 'Vazio', color: 'bg-transparent', textColor: 'text-gray-500', startTime: '', endTime: '' },
  'M': { label: 'Manhã', color: 'bg-blue-200', textColor: 'text-blue-800', startTime: '08:00', endTime: '16:00' },
  'T': { label: 'Tarde', color: 'bg-orange-200', textColor: 'text-orange-800', startTime: '16:00', endTime: '00:00' },
  'N': { label: 'Noite', color: 'bg-indigo-200', textColor: 'text-indigo-800', startTime: '00:00', endTime: '08:00' },
  'E': { label: 'Encarregada', color: 'bg-pink-200', textColor: 'text-pink-800', startTime: '09:00', endTime: '17:00' },
  'L': { label: 'Limpeza', color: 'bg-teal-200', textColor: 'text-teal-800', startTime: '09:00', endTime: '17:00' },
  'F': { label: 'Folga', color: 'bg-gray-200', textColor: 'text-gray-800', startTime: '', endTime: '' },
  'FE': { label: 'Férias', color: 'bg-green-200', textColor: 'text-green-800', startTime: '', endTime: '' },
};

export const ROLES = {
  AUXILIAR: { 
    label: 'Auxiliar', 
    allowedShifts: ['M', 'T', 'N', 'F', 'FE'], 
    color: 'bg-gray-200 text-gray-800',
    schedulingStrategy: 'complex' // <-- Adicionado
  },
  ENCARREGADA: { 
    label: 'Encarregada', 
    allowedShifts: ['E', 'F', 'FE'], 
    color: 'bg-pink-200 text-pink-800',
    schedulingStrategy: 'simple' // <-- Adicionado
  },
  LIMPEZA: { 
    label: 'Empregada de Limpeza', 
    allowedShifts: ['L', 'F', 'FE'], 
    color: 'bg-teal-200 text-teal-800',
    schedulingStrategy: 'simple' // <-- Adicionado
  },
};

export const initialEmployees = [
  { id: 1, name: 'Ângela Santos', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 2, name: 'Cátia Rodrigues', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 3, name: 'Cristina Vieira', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 4, name: 'Florinda Braga', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 5, name: 'Joana Moreira', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 6, name: 'Maria Campos', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 7, name: 'Michele Mendes', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 8, name: 'Rosa Moura', role: 'AUXILIAR', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 9, name: 'Pamela Santos', role: 'ENCARREGADA', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 10, name: 'Fátima Nunes', role: 'ENCARREGADA', shifts: {}, excludedShifts: [], targetHours: 160 },
  { id: 11, name: 'Sónia', role: 'LIMPEZA', shifts: {}, excludedShifts: [], targetHours: 160 },
];