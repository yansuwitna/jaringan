import React, { useRef, useState } from 'react';
import { 
  Database, 
  Sparkles,
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Trash2, 
  ShieldAlert,
  Globe,
  Zap,
  Video,
  Droplets,
  Layers,
  Cpu,
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import { IPGroup, IPAllocation, DeviceCategory, IPService, DnsRecord, SubDomainRecord } from '../types/ipam';
import { 
  ElectricityDevice, 
  ElectricityCableRun,
  CctvDevice, 
  CctvCableRun,
  WaterDevice, 
  WaterPipeRun,
  SoundDevice,
  SoundCableRun,
  LanDevice, 
  LanCableRun, 
  LanLocation, 
  LanZone 
} from '../types/jaringanUtilitas';
import { UserAccount } from '../types/auth';
import { generateDemoData } from '../utils/dataContoh';
import { exportBackupJson, parseImportJson, exportAllToSingleXlsx } from '../utils/eksporImpor';
import { awaitSyncQueue, setSyncProgressListener } from '../utils/api';
import Swal from 'sweetalert2';
import { showConfirm, showSuccess, showError, showWarning } from '../utils/swal';
import { ModalPortal } from './ModalPortal';

interface BackupViewProps {
  groups: IPGroup[];
  allocations: IPAllocation[];
  categories: DeviceCategory[];
  users: UserAccount[];
  services?: IPService[];
  dnsRecords?: DnsRecord[];
  subDomains?: SubDomainRecord[];
  electricityDevices?: ElectricityDevice[];
  electricityCables?: ElectricityCableRun[];
  cctvDevices?: CctvDevice[];
  cctvCables?: CctvCableRun[];
  waterDevices?: WaterDevice[];
  soundDevices?: SoundDevice[];
  waterPipes?: WaterPipeRun[];
  soundCables?: SoundCableRun[];
  lanLocations?: LanLocation[];
  lanZones?: LanZone[];
  lanDevices?: LanDevice[];
  lanCables?: LanCableRun[];
  lanDeviceTypes?: any[];
  lanCableTypes?: any[];
  lanRoomTypes?: any[];
  electricityDeviceTypes?: any[];
  electricityCableTypes?: any[];
  cctvDeviceTypes?: any[];
  cctvCableTypes?: any[];
  waterDeviceTypes?: any[];
  soundDeviceTypes?: any[];
  waterPipeTypes?: any[];
  soundCableTypes?: any[];
  urlProtocols?: any[];
  dnsRecordTypes?: any[];
  onImportData: (data: {
    groups?: IPGroup[];
    allocations?: IPAllocation[];
    categories?: DeviceCategory[];
    users?: UserAccount[];
    services?: IPService[];
    dnsRecords?: DnsRecord[];
    subDomains?: SubDomainRecord[];
    urlProtocols?: any[];
    dnsRecordTypes?: any[];
    electricityDevices?: ElectricityDevice[];
    electricityCables?: ElectricityCableRun[];
    cctvDevices?: CctvDevice[];
    cctvCables?: CctvCableRun[];
    waterDevices?: WaterDevice[];
  soundDevices?: SoundDevice[];
    waterPipes?: WaterPipeRun[];
  soundCables?: SoundCableRun[];
    lanLocations?: LanLocation[];
    lanZones?: LanZone[];
    lanDevices?: LanDevice[];
    lanCables?: LanCableRun[];
    lanDeviceTypes?: any[];
    lanCableTypes?: any[];
    lanRoomTypes?: any[];
    electricityDeviceTypes?: any[];
    electricityCableTypes?: any[];
    cctvDeviceTypes?: any[];
    cctvCableTypes?: any[];
    waterDeviceTypes?: any[];
  soundDeviceTypes?: any[];
    waterPipeTypes?: any[];
  soundCableTypes?: any[];
  }, isDemo?: boolean) => void;
  onWipeAllData: () => Promise<void> | void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  groups,
  allocations,
  categories,
  users,
  services = [],
  dnsRecords = [],
  subDomains = [],
  electricityDevices = [],
  electricityCables = [],
  cctvDevices = [],
  cctvCables = [],
  waterDevices = [],
  soundDevices = [],
  waterPipes = [],
  soundCables = [],
  lanLocations = [],
  lanZones = [],
  lanDevices = [],
  lanCables = [],
  lanDeviceTypes = [],
  lanCableTypes = [],
  lanRoomTypes = [],
  electricityDeviceTypes = [],
  electricityCableTypes = [],
  cctvDeviceTypes = [],
  cctvCableTypes = [],
  waterDeviceTypes = [],
  soundDeviceTypes = [],
  waterPipeTypes = [],
  soundCableTypes = [],
  urlProtocols = [],
  dnsRecordTypes = [],
  onImportData,
  onWipeAllData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasBackedUp, setHasBackedUp] = useState(false);

  // Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  
  // Granular Checkboxes
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

  const handleDownloadFullBackup = () => {
    exportBackupJson(
      groups, 
      allocations, 
      categories, 
      users, 
      services, 
      dnsRecords, 
      subDomains,
      electricityDevices,
      cctvDevices,
      waterDevices,
      soundDevices,
      lanDevices,
      lanCables,
      lanLocations,
      lanZones,
      electricityCables,
      cctvCables,
      waterPipes,
      soundCables,
      lanDeviceTypes,
      lanRoomTypes,
      lanCableTypes,
      electricityDeviceTypes,
      electricityCableTypes,
      cctvDeviceTypes,
      cctvCableTypes,
      waterDeviceTypes,
      waterPipeTypes,
      soundDeviceTypes,
      soundCableTypes,
      urlProtocols,
      dnsRecordTypes
    );
    setHasBackedUp(true);
    showSuccess('Cadangan Berhasil Diunduh', 'Berkas cadangan format JSON berhasil disimpan.');
  };

  const handleExportAllToXlsx = () => {
    if (
      groups.length === 0 && 
      allocations.length === 0 && 
      lanDevices.length === 0 && 
      electricityDevices.length === 0 && 
      cctvDevices.length === 0 && 
      waterDevices.length === 0
    ) {
      showWarning('Data Kosong', 'Tidak ada data infrastruktur untuk diekspor ke format Excel.');
      return;
    }

    exportAllToSingleXlsx({
      groups,
      allocations,
      services,
      categories,
      dnsRecords,
      subDomains,
      lanLocations,
      lanZones,
      lanDevices,
      lanCables,
      electricityDevices,
      electricityCables,
      cctvDevices,
      cctvCables,
      waterDevices,
      waterPipes
    });

    showSuccess('Ekspor Berhasil', 'Seluruh data infrastruktur (LAN, Listrik, CCTV, AIR, DNS) telah diekspor ke dalam 1 berkas Excel (.xlsx).');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseImportJson(content);
        
        setPendingRestoreData(parsed);
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
        setIsRestoreModalOpen(true);
        
      } catch (error) {
        showError('Pemulihan Gagal', 'Berkas JSON tidak valid atau rusak.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeRestore = () => {
    if (!pendingRestoreData) return;

    const anySelected = restoreLan || restoreIpam || restoreElectricity || restoreCctv || 
      restoreWater || restoreSound || restoreDns || restoreSub || restoreServices || restoreCategories || restoreUsers;
    
    if (!anySelected) {
      showWarning('Belum Ada Pilihan', 'Pilih minimal satu kategori data untuk dipulihkan.');
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
    
    onImportData(dataToRestore);
    setIsRestoreModalOpen(false);
    setPendingRestoreData(null);
    
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

  const handleWipeAll = async () => {
    if (!hasBackedUp) return;
    
    const confirmed = await showConfirm({
      title: 'HAPUS BERSIH SEMUA DATA?',
      text: 'PERINGATAN FATAL: Seluruh data LAN, Listrik, CCTV, AIR, DNS, layanan, kategori, dan akun akan dihapus permanen dari database SQLite.\n\nApakah Anda benar-benar yakin?',
      confirmButtonText: 'Ya, Hapus Bersih Semuanya',
      cancelButtonText: 'Batal',
      isDanger: true
    });

    if (confirmed) {
      await onWipeAllData();
      showSuccess('Database Dikosongkan', 'Seluruh data sistem telah berhasil dihapus bersih.');
    }
  };

  const handleGenerateDemo = async () => {
    const confirmed = await showConfirm({
      title: 'Buat Data Demo?',
      text: 'Aksi ini akan menimpa seluruh tabel dengan data demo (kecuali akun admin/pengguna Anda akan tetap aman). Lanjutkan?',
      confirmButtonText: 'Ya, Buat Data Demo',
      cancelButtonText: 'Batal'
    });

    if (confirmed) {
      const demoData = generateDemoData();
      onImportData(demoData, true);
      showSuccess('Data Demo Berhasil Dibuat', 'Berbagai tabel telah terisi oleh data contoh untuk keperluan pengujian dan presentasi.');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header dengan background abu-abu standar seragam */}
      <div className="bg-slate-300 dark:bg-slate-800/95 border border-slate-400/80 dark:border-slate-700 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-200 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl">
            <Database className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Pusat Cadangan & Pemulihan Data Terpadu
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Ekspor 1 file komprehensif, pemulihan data selektif, dan reset basis data SQLite.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadFullBackup}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Cadangan Lengkap (1 File JSON)</span>
        </button>
      </div>

      {/* Grid Menu Cadangan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card Ekspor Excel Tunggal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/60">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Ekspor Laporan Spreadsheet (1 File XLSX)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unduh seluruh infrastruktur (LAN, Listrik, CCTV, AIR, IP) ke dalam 1 file Excel multi-sheet.</p>
            </div>
          </div>
          <button
            onClick={handleExportAllToXlsx}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Semua Data ke 1 Berkas Excel (.xlsx)</span>
          </button>
        </div>

        {/* Card Impor / Restore JSON */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/60">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pulihkan Data (Impor JSON)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Muat berkas cadangan JSON dan pilih kategori data yang ingin dipulihkan secara fleksibel.</p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Upload className="w-4 h-4" />
            <span>Pilih Berkas Cadangan JSON & Restore</span>
          </button>
        </div>

      </div>

      {/* Area Demo */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">Data Dummy (Demo)</h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                Otomatis mengisi tabel sistem dengan data contoh fiktif. (Catatan: Akun Anda akan tetap utuh, tabel lain akan diganti).
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateDemo}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-600/30 transition-all cursor-pointer flex-shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buat Data Demo</span>
          </button>
        </div>
      </div>

      {/* Area Bahaya (Wipe Data) */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">Area Kritis: Hapus Bersih Seluruh Data</h3>
            <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
              Tindakan ini akan mengosongkan SELURUH tabel database SQLite (LAN, Listrik, CCTV, AIR, IPAM, DNS, Kategori, Layanan, dan Akun Pengguna).
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {hasBackedUp ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Unlock className="w-4 h-4" /> Cadangan telah diunduh. Kunci penghapusan dibuka.
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Lock className="w-4 h-4" /> Kunci aktif: Unduh cadangan JSON terlebih dahulu untuk membuka tombol hapus.
              </span>
            )}
          </div>
          <button
            onClick={handleWipeAll}
            disabled={!hasBackedUp}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              hasBackedUp 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 cursor-pointer' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Bersih Database</span>
          </button>
        </div>
      </div>

      {/* Restore Modal */}
      {isRestoreModalOpen && pendingRestoreData && (
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
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal Semua
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                File cadangan siap diproses. Anda dapat menentukan data apa saja yang akan dipulihkan ke sistem:
              </p>
              
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl max-h-[55vh] overflow-y-auto">
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreLan} onChange={() => setRestoreLan(!restoreLan)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                      Jaringan LAN, Lokasi & Master LAN
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.lanLocations?.length || 0} Lokasi, {pendingRestoreData.lanZones?.length || 0} Lab/Ruang, {pendingRestoreData.lanDevices?.length || 0} Switch/Rack, {pendingRestoreData.lanCables?.length || 0} Kabel LAN, {pendingRestoreData.lanDeviceTypes?.length || 0} Tipe Perangkat, {pendingRestoreData.lanCableTypes?.length || 0} Jenis Kabel, {pendingRestoreData.lanRoomTypes?.length || 0} Tipe Ruangan
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreIpam} onChange={() => setRestoreIpam(!restoreIpam)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Alamat IP & Subnet (IPAM)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.groups?.length || 0} Subnet, {pendingRestoreData.allocations?.length || 0} Alokasi Host IP
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreElectricity} onChange={() => setRestoreElectricity(!restoreElectricity)} className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                      Jaringan Listrik & Master Listrik
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.electricityDevices?.length || 0} Panel/UPS, {pendingRestoreData.electricityCables?.length || 0} Kabel Listrik, {pendingRestoreData.electricityDeviceTypes?.length || 0} Tipe Komponen, {pendingRestoreData.electricityCableTypes?.length || 0} Jenis Kabel
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreCctv} onChange={() => setRestoreCctv(!restoreCctv)} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 transition-colors">
                      Jaringan CCTV & Master CCTV
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.cctvDevices?.length || 0} Kamera/NVR, {pendingRestoreData.cctvCables?.length || 0} Kabel CCTV, {pendingRestoreData.cctvDeviceTypes?.length || 0} Tipe Hardware, {pendingRestoreData.cctvCableTypes?.length || 0} Jenis Kabel
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreWater} onChange={() => setRestoreWater(!restoreWater)} className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 transition-colors">
                      Jaringan AIR & Master Pipa
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.waterDevices?.length || 0} Pompa/Toren, {pendingRestoreData.waterPipes?.length || 0} Pipa, {pendingRestoreData.waterDeviceTypes?.length || 0} Tipe Alat, {pendingRestoreData.waterPipeTypes?.length || 0} Jenis Pipa
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreSound} onChange={() => setRestoreSound(!restoreSound)} className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-fuchsia-600 transition-colors">
                      Jaringan SOUND & Master Kabel
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.soundDevices?.length || 0} Speaker/Amp, {pendingRestoreData.soundCables?.length || 0} Kabel, {pendingRestoreData.soundDeviceTypes?.length || 0} Tipe Alat, {pendingRestoreData.soundCableTypes?.length || 0} Jenis Kabel
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <input type="checkbox" checked={restoreDns} onChange={() => setRestoreDns(!restoreDns)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                      Data Domain Utama (DNS) & Master Record
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {pendingRestoreData.dnsRecords?.length || 0} Domain, {pendingRestoreData.urlProtocols?.length || 0} Protokol URL, {pendingRestoreData.dnsRecordTypes?.length || 0} Tipe Record
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
                      {pendingRestoreData.subDomains?.length || 0} Record Subdomain
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
                      {pendingRestoreData.services?.length || 0} Data Layanan Port
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
                      {pendingRestoreData.categories?.length || 0} Kategori Perangkat
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
                      {pendingRestoreData.users?.length || 0} Akun Pengguna Terdaftar
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 w-full">
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setPendingRestoreData(null);
                }}
                className="justify-center px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={executeRestore}
                className="justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
              >
                Pulihkan Data Terpilih
              </button>
            </div>
          </div>
        </div>
        </div>
        </ModalPortal>
      )}

    </div>
  );
};

