import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { ModalPortal } from './ModalPortal';
import { awaitSyncQueue, setSyncProgressListener } from '../utils/api';
import Swal from 'sweetalert2';

interface ModalRestoreProps {
  isOpen: boolean;
  pendingRestoreData: any;
  onClose: () => void;
  onConfirm: (dataToRestore: any) => void;
}

export const ModalRestore: React.FC<ModalRestoreProps> = ({
  isOpen,
  pendingRestoreData,
  onClose,
  onConfirm
}) => {
  const [restoreLan, setRestoreLan] = useState(true);
  const [restoreIpam, setRestoreIpam] = useState(true);
  const [restoreElectricity, setRestoreElectricity] = useState(true);
  const [restoreCctv, setRestoreCctv] = useState(true);
  const [restoreWater, setRestoreWater] = useState(true);
  const [restoreSound, setRestoreSound] = useState(true);
  const [restoreDns, setRestoreDns] = useState(true);
  const [restoreSub, setRestoreSub] = useState(true);
  const [restoreServices, setRestoreServices] = useState(true);
  const [restoreCategories, setRestoreCategories] = useState(true);
  const [restoreUsers, setRestoreUsers] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setRestoreLan(true);
      setRestoreIpam(true);
      setRestoreElectricity(true);
      setRestoreCctv(true);
      setRestoreWater(true);
      setRestoreSound(true);
      setRestoreDns(true);
      setRestoreSub(true);
      setRestoreServices(true);
      setRestoreCategories(true);
      setRestoreUsers(true);
    }
  }, [isOpen, pendingRestoreData]);

  if (!isOpen || !pendingRestoreData) return null;

  const handleSelectAll = (select: boolean) => {
    setRestoreLan(select);
    setRestoreIpam(select);
    setRestoreElectricity(select);
    setRestoreCctv(select);
    setRestoreWater(select);
    setRestoreSound(select);
    setRestoreDns(select);
    setRestoreSub(select);
    setRestoreServices(select);
    setRestoreCategories(select);
    setRestoreUsers(select);
  };

  const handleConfirm = () => {
    const anySelected = restoreLan || restoreIpam || restoreElectricity || restoreCctv || 
      restoreWater || restoreSound || restoreDns || restoreSub || restoreServices || restoreCategories || restoreUsers;
    
    if (!anySelected) {
      alert('Pilih minimal satu kategori data untuk dipulihkan.');
      return;
    }
    
    const dataToRestore: any = {};
    if (restoreLan) {
      dataToRestore.lanLocations = pendingRestoreData.lanLocations;
      dataToRestore.lanZones = pendingRestoreData.lanZones;
      dataToRestore.lanDevices = pendingRestoreData.lanDevices;
      dataToRestore.lanCables = pendingRestoreData.lanCables;
      dataToRestore.lanDeviceTypes = pendingRestoreData.lanDeviceTypes;
      dataToRestore.lanCableTypes = pendingRestoreData.lanCableTypes;
      dataToRestore.lanRoomTypes = pendingRestoreData.lanRoomTypes;
    }
    if (restoreIpam) {
      dataToRestore.groups = pendingRestoreData.groups;
      dataToRestore.allocations = pendingRestoreData.allocations;
    }
    if (restoreElectricity) {
      dataToRestore.electricityDevices = pendingRestoreData.electricityDevices;
      dataToRestore.electricityDeviceTypes = pendingRestoreData.electricityDeviceTypes;
      dataToRestore.electricityCables = pendingRestoreData.electricityCables;
      dataToRestore.electricityCableTypes = pendingRestoreData.electricityCableTypes;
    }
    if (restoreCctv) {
      dataToRestore.cctvDevices = pendingRestoreData.cctvDevices;
      dataToRestore.cctvDeviceTypes = pendingRestoreData.cctvDeviceTypes;
      dataToRestore.cctvCables = pendingRestoreData.cctvCables;
      dataToRestore.cctvCableTypes = pendingRestoreData.cctvCableTypes;
    }
    if (restoreWater) {
      dataToRestore.waterDevices = pendingRestoreData.waterDevices;
      dataToRestore.waterDeviceTypes = pendingRestoreData.waterDeviceTypes;
      dataToRestore.waterPipes = pendingRestoreData.waterPipes;
      dataToRestore.waterPipeTypes = pendingRestoreData.waterPipeTypes;
    }
    if (restoreSound) {
      dataToRestore.soundDevices = pendingRestoreData.soundDevices;
      dataToRestore.soundDeviceTypes = pendingRestoreData.soundDeviceTypes;
      dataToRestore.soundCables = pendingRestoreData.soundCables;
      dataToRestore.soundCableTypes = pendingRestoreData.soundCableTypes;
    }
    if (restoreDns) {
      dataToRestore.dnsRecords = pendingRestoreData.dnsRecords;
      dataToRestore.urlProtocols = pendingRestoreData.urlProtocols;
      dataToRestore.dnsRecordTypes = pendingRestoreData.dnsRecordTypes;
    }
    if (restoreSub) dataToRestore.subDomains = pendingRestoreData.subDomains;
    if (restoreServices) dataToRestore.services = pendingRestoreData.services;
    if (restoreCategories) dataToRestore.categories = pendingRestoreData.categories;
    if (restoreUsers) dataToRestore.users = pendingRestoreData.users;
    
    onConfirm(dataToRestore);

    setSyncProgressListener((completed, total) => {
      const percentage = Math.round((completed / total) * 100);
      Swal.update({
        html: `Menyimpan tabel ke server (${completed}/${total})...<br/><br/>
               <div style="width: 100%; background: #e2e8f0; border-radius: 8px; overflow: hidden; height: 12px;">
                 <div style="width: ${percentage}%; background: #4f46e5; height: 100%; transition: width 0.3s ease;"></div>
               </div>
               <div style="text-align: center; margin-top: 5px; font-size: 12px;">${percentage}% Selesai</div>`
      });
    });

    Swal.fire({
      title: 'Memulihkan Data...',
      html: 'Menyiapkan sinkronisasi data...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    awaitSyncQueue().then(() => {
      setSyncProgressListener(null);
      Swal.fire(
        'Pemulihan Sukses',
        'Seluruh data pilihan Anda berhasil dipulihkan ke sistem dan database.',
        'success'
      ).then(() => {
        window.location.reload();
      });
    });
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs font-poppins animate-in fade-in duration-150">
        <div className="min-h-full flex items-center justify-center p-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl overflow-hidden max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] my-auto flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Pilih Data Yang Ingin Dipulihkan
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectAll(true)}
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  Pilih Semua
                </button>
                <button
                  onClick={() => handleSelectAll(false)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal Pilih
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-xl border border-yellow-200 dark:border-yellow-800">
                Pilih modul/kategori data mana saja yang ingin dipulihkan dari file backup Anda. Data lama pada kategori yang dicentang akan <strong>ditimpa (dihapus dan diganti)</strong> dengan data baru dari file JSON.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreLan} onChange={() => setRestoreLan(!restoreLan)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                      Jaringan LAN & Master
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.lanDevices?.length || 0} Perangkat, {pendingRestoreData.lanCables?.length || 0} Kabel
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreIpam} onChange={() => setRestoreIpam(!restoreIpam)} className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 transition-colors">
                      Grup IP & Alokasi
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.groups?.length || 0} Grup, {pendingRestoreData.allocations?.length || 0} IP
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreElectricity} onChange={() => setRestoreElectricity(!restoreElectricity)} className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                      Jaringan Listrik
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.electricityDevices?.length || 0} Perangkat, {pendingRestoreData.electricityCables?.length || 0} Kabel
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreCctv} onChange={() => setRestoreCctv(!restoreCctv)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                      Jaringan CCTV
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.cctvDevices?.length || 0} Kamera/NVR, {pendingRestoreData.cctvCables?.length || 0} Kabel
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreWater} onChange={() => setRestoreWater(!restoreWater)} className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 transition-colors">
                      Jaringan AIR & Pipa
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.waterDevices?.length || 0} Pompa/Toren, {pendingRestoreData.waterPipes?.length || 0} Pipa
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreSound} onChange={() => setRestoreSound(!restoreSound)} className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-fuchsia-600 transition-colors">
                      Jaringan SOUND
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.soundDevices?.length || 0} Speaker/Amp, {pendingRestoreData.soundCables?.length || 0} Kabel
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreDns} onChange={() => setRestoreDns(!restoreDns)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Data Domain Utama (DNS)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.dnsRecords?.length || 0} Domain
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreSub} onChange={() => setRestoreSub(!restoreSub)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Data Sub-Domain
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.subDomains?.length || 0} Record
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreServices} onChange={() => setRestoreServices(!restoreServices)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Layanan & Port
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.services?.length || 0} Layanan Port
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreCategories} onChange={() => setRestoreCategories(!restoreCategories)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Kategori Perangkat
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.categories?.length || 0} Kategori
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreUsers} onChange={() => setRestoreUsers(!restoreUsers)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Akun Pengguna
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.users?.length || 0} Akun Pengguna
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 w-full">
              <button
                onClick={onClose}
                className="justify-center px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                Pulihkan Data Terpilih
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
