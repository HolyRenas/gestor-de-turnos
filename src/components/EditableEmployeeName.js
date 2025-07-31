// src/components/EditableEmployeeName.js
import React, { useState, useEffect, useRef } from 'react';
import Edit3 from './icons/Edit3'; // Importar o ícone que ele usa!

const EditableEmployeeName = ({ id, name, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef(null);
  useEffect(() => { if (isEditing) inputRef.current.focus(); }, [isEditing]);
  const handleSave = () => { if (tempName.trim()) onSave(id, tempName.trim()); setIsEditing(false); };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSave(); else if (e.key === 'Escape') { setTempName(name); setIsEditing(false); } };
  if (isEditing) { return <input ref={inputRef} type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="font-medium text-gray-900 bg-gray-100 rounded-md p-1 -m-1" />; }
  return (<div onClick={() => setIsEditing(true)} className="cursor-pointer flex items-center gap-2 group"><span className="font-medium text-gray-900">{name}</span><Edit3 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" /></div>);
};

export default EditableEmployeeName;