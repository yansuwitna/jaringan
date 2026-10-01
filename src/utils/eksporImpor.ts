import * as XLSX from 'xlsx';
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

export interface ComprehensiveExportOptions {
  groups: IPGroup[];
  allocations: IPAllocation[];
  services?: IPService[];
  categories?: DeviceCategory[];
  dnsRecords?: DnsRecord[];
  subDomains?: SubDomainRecord[];
  lanLocations?: LanLocation[];
  lanZones?: LanZone[];
  lanDevices?: LanDevice[];
  lanCables?: LanCableRun[];
  electricityDevices?: ElectricityDevice[];
  electricityCables?: ElectricityCableRun[];
  cctvDevices?: CctvDevice[];
  cctvCables?: CctvCableRun[];
  waterDevices?: WaterDevice[];
  waterPipes?: WaterPipeRun[];
  soundDevices?: SoundDevice[];
  soundCables?: SoundCableRun[];
}

/**
 * Ekspor seluruh data infrastruktur ke dalam 1 berkas Excel (.xlsx) dengan multi-sheet
 */
export function exportAllToSingleXlsx(data: ComprehensiveExportOptions): void {
  const workbook = XLSX.utils.book_new();
  const {
    groups = [],
    allocations = [],
    services = [],
    categories = [],
    lanLocations = [],
    lanZones = [],
    lanDevices = [],
    lanCables = [],
    electricityDevices = [],
    electricityCables = [],
    cctvDevices = [],
    cctvCables = [],
    waterDevices = [],
    soundDevices = [],
    waterPipes = [],
    dnsRecords = [],
    subDomains = []
  } = data;

  const exportDateStr = new Date().toLocaleString('id-ID');

  // Helper dictionary lookup
  const locMap = new Map(lanLocations.map(l => [l.id, l.name]));
  const zoneMap = new Map(lanZones.map(z => [z.id, z.name]));
  const groupMap = new Map(groups.map(g => [g.id, g.name]));

  // 1. SHEET RINGKASAN SUBNET IPAM
  const groupHeaders = ['No', 'Nama Subnet', 'CIDR', 'Gateway', 'VLAN', 'Lokasi', 'PIC', 'Total IP', 'Digunakan', 'Persentase'];
  const groupRows = groups.map((g, idx) => {
    const groupAllocs = allocations.filter(a => a.groupId === g.id);
    const usedCount = groupAllocs.filter(a => a.status === 'used' || a.status === 'reserved').length;
    const totalCount = groupAllocs.length || 1;
    const pct = Math.round((usedCount / totalCount) * 100);
    return [
      idx + 1,
      g.name,
      g.cidr,
      g.gateway || '-',
      g.vlanId ? `VLAN ${g.vlanId}` : '-',
      g.location || '-',
      g.pic || '-',
      groupAllocs.length,
      usedCount,
      `${pct}%`
    ];
  });
  const wsGroups = XLSX.utils.aoa_to_sheet([
    ['LAPORAN DATA SUBNET & IPAM'],
    ['Tanggal Ekspor', exportDateStr],
    [],
    groupHeaders,
    ...groupRows
  ]);
  wsGroups['!cols'] = [
    { wch: 6 }, { wch: 24 }, { wch: 18 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsGroups, 'Daftar Subnet IP');

  // 2. SHEET SEMUA ALOKASI HOST IP
  const allocHeaders = ['No', 'Subnet', 'Alamat IP', 'Hostname', 'Kategori', 'MAC Address', 'PIC', 'Departemen', 'Status', 'Layanan & Port', 'Keterangan'];
  const allocRows = allocations.map((a, idx) => {
    const itemServices = services.filter(s => s.allocationId === a.id || s.ip === a.ip);
    const servicesStr = itemServices.length > 0 
      ? itemServices.map(s => `${s.name} (${s.port}/${s.protocol})`).join(', ')
      : '-';

    const raw = (a.deviceType || '').toLowerCase();
    const cleanRaw = raw.replace(/_/g, ' ');
    const cat = categories.find(c => 
      c.id.toLowerCase() === raw || 
      c.name.toLowerCase() === raw ||
      c.id.toLowerCase().replace(/_/g, ' ') === cleanRaw ||
      c.name.toLowerCase().replace(/_/g, ' ') === cleanRaw
    );
    const categoryName = cat ? cat.name : (a.deviceType ? a.deviceType.replace(/_/g, ' ') : '-');

    return [
      idx + 1,
      groupMap.get(a.groupId) || a.groupId,
      a.ip,
      a.hostname || '-',
      categoryName,
      a.macAddress || '-',
      a.assignedTo || '-',
      a.department || '-',
      a.status === 'used' ? 'Digunakan' : a.status === 'reserved' ? 'Reserved' : a.status === 'dhcp' ? 'DHCP Pool' : 'Bebas',
      servicesStr,
      a.notes || '-'
    ];
  });
  const wsAllocs = XLSX.utils.aoa_to_sheet([
    ['LAPORAN SELURUH ALOKASI HOST IP ADDRESS'],
    ['Tanggal Ekspor', exportDateStr],
    [],
    allocHeaders,
    ...allocRows
  ]);
  wsAllocs['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 28 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsAllocs, 'Alokasi IP Host');

  // 3. SHEET JARINGAN LAN (LOKASI, PERANGKAT & JALUR KABEL)
  const lanDevHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Nama Perangkat', 'Kode', 'Tipe', 'IP Address', 'Total Port', 'Status', 'PIC'];
  const lanDevRows = lanDevices.map((d, idx) => [
    idx + 1,
    locMap.get(d.locationId || '') || d.location || '-',
    zoneMap.get(d.zoneId || '') || '-',
    d.name,
    d.code || '-',
    d.type,
    d.ipAddress || '-',
    d.totalPorts || 0,
    d.status,
    d.pic || '-'
  ]);

  const lanCableHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Kode Kabel', 'Tipe Kabel', 'Perangkat Asal', 'Port Asal', 'Perangkat Tujuan', 'Port Tujuan', 'Panjang (m)', 'Jalur Fisik', 'Status'];
  const lanCableRows = lanCables.map((c, idx) => [
    idx + 1,
    locMap.get(c.locationId || '') || c.sourceLocation || '-',
    zoneMap.get(c.zoneId || '') || '-',
    c.cableCode,
    c.cableType,
    c.sourceDeviceName || c.sourceLocation,
    c.sourcePort || '-',
    c.targetDeviceName || c.targetLocation,
    c.targetPort || '-',
    c.lengthMeter || 0,
    c.pathwayRoute || '-',
    c.status
  ]);

  const wsLan = XLSX.utils.aoa_to_sheet([
    ['LAPORAN INFRASTRUKTUR JARINGAN LAN'],
    ['Tanggal Ekspor', exportDateStr],
    [],
    ['--- DAFTAR PERANGKAT LAN (SWITCH, RACK, ACCESS POINT, ROUTER) ---'],
    lanDevHeaders,
    ...lanDevRows,
    [],
    ['--- DAFTAR JALUR KABEL LAN (UTP / FIBER OPTIC) ---'],
    lanCableHeaders,
    ...lanCableRows
  ]);
  wsLan['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsLan, 'Jaringan LAN');

  // 4. SHEET JARINGAN LISTRIK (PERANGKAT & DISTRIBUSI KABEL)
  const elDevHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Nama Komponen', 'Kode', 'Tipe', 'Fase', 'Tegangan (V)', 'Kapasitas (Watt)', 'Beban (Watt)', 'Status', 'PIC'];
  const elDevRows = electricityDevices.map((d, idx) => [
    idx + 1,
    locMap.get(d.locationId || '') || d.location || '-',
    zoneMap.get(d.zoneId || '') || '-',
    d.name,
    d.code || '-',
    d.type,
    d.phase === '3_phase' ? '3 Phase' : '1 Phase',
    d.voltage || 220,
    d.capacityWatt || 0,
    d.currentLoadWatt || 0,
    d.status,
    d.pic || '-'
  ]);

  const elCableHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Kode Kabel', 'Tipe Kabel', 'Sumber / Panel Asal', 'Tujuan Jalur', 'Spesifikasi Core', 'Panjang (m)', 'Jalur Conduit / Tray', 'Status'];
  const elCableRows = electricityCables.map((c, idx) => [
    idx + 1,
    locMap.get(c.locationId || '') || c.sourceLocation || '-',
    zoneMap.get(c.zoneId || '') || '-',
    c.cableCode,
    c.cableType,
    c.sourceDeviceName || c.sourceLocation,
    c.targetDeviceName || c.targetLocation,
    c.coreSpec || '-',
    c.lengthMeter || c.lengthMeters || 0,
    c.pathwayRoute || c.pathDescription || '-',
    c.status
  ]);

  const wsEl = XLSX.utils.aoa_to_sheet([
    ['LAPORAN DISTRIBUSI JARINGAN LISTRIK'],
    ['Tanggal Ekspor', exportDateStr],
    [],
    ['--- DAFTAR PERANGKAT LISTRIK (MDP, SDP, MCB, UPS, GENSET) ---'],
    elDevHeaders,
    ...elDevRows,
    [],
    ['--- DAFTAR DISTRIBUSI KABEL LISTRIK (NYY, NYM, KABEL POWER) ---'],
    elCableHeaders,
    ...elCableRows
  ]);
  wsEl['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 28 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsEl, 'Jaringan Listrik');

  // 5. SHEET JARINGAN CCTV (KAMERA, NVR & KABEL DATA/COAXIAL)
  const cctvDevHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Nama Kamera / NVR', 'Tipe', 'IP Address', 'Resolusi', 'Channel NVR', 'Brand & Model', 'Status', 'PIC'];
  const cctvDevRows = cctvDevices.map((d, idx) => [
    idx + 1,
    locMap.get(d.locationId || '') || d.location || '-',
    zoneMap.get(d.zoneId || '') || '-',
    d.name,
    d.type,
    d.ipAddress || '-',
    d.resolution || '-',
    d.channelNumber ? `CH-${d.channelNumber}` : '-',
    `${d.brand || ''} ${d.model || ''}`.trim() || '-',
    d.status,
    d.pic || '-'
  ]);

  const cctvCableHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Kode Kabel', 'Tipe Kabel', 'Sumber (NVR / Switch PoE)', 'Tujuan (Kamera / Monitor)', 'Panjang (m)', 'Jalur / Conduit', 'Status'];
  const cctvCableRows = cctvCables.map((c, idx) => [
    idx + 1,
    locMap.get(c.locationId || '') || c.sourceLocation || '-',
    zoneMap.get(c.zoneId || '') || '-',
    c.cableCode,
    c.cableType,
    c.sourceDeviceName || c.sourceLocation,
    c.targetDeviceName || c.targetLocation,
    c.lengthMeter || c.lengthMeters || 0,
    c.pathwayRoute || c.pathDescription || '-',
    c.status
  ]);

  const wsCctv = XLSX.utils.aoa_to_sheet([
    ['LAPORAN SISTEM PENGAWASAN JARINGAN CCTV'],
    ['Tanggal Ekspor', exportDateStr],
    [],
    ['--- DAFTAR KAMERA CCTV & NVR ---'],
    cctvDevHeaders,
    ...cctvDevRows,
    [],
    ['--- DAFTAR JALUR KABEL CCTV (CAT6 POE / COAXIAL RG59) ---'],
    cctvCableHeaders,
    ...cctvCableRows
  ]);
  wsCctv['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsCctv, 'Jaringan CCTV');

  // 6. SHEET JARINGAN AIR & IRIGASI (POMPA, TOREN & PIPA)
  const waterDevHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Nama Titik / Pompa', 'Kode', 'Tipe', 'Diameter Pipa', 'Debit (L/m)', 'Tekanan (Bar)', 'Kapasitas Toren', 'Level (%)', 'Status'];
  const waterDevRows = waterDevices.map((d, idx) => [
    idx + 1,
    locMap.get(d.locationId || '') || d.location || '-',
    zoneMap.get(d.zoneId || '') || '-',
    d.name,
    d.code || '-',
    d.type,
    d.pipeDiameter || '-',
    d.flowRateLpm || 0,
    d.pressureBar || 0,
    d.tankCapacityLiter ? `${d.tankCapacityLiter} L` : '-',
    d.currentWaterLevelPct !== undefined ? `${d.currentWaterLevelPct}%` : '-',
    d.status
  ]);

  const waterPipeHeaders = ['No', 'Lokasi', 'Lab / Ruang', 'Kode Pipa', 'Tipe Pipa', 'Diameter', 'Titik Asal / Sumber', 'Titik Tujuan / Distribusi', 'Panjang (m)', 'Jalur Pipa', 'Status'];
  const waterPipeRows = waterPipes.map((p, idx) => [
    idx + 1,
    locMap.get(p.locationId || '') || p.sourceLocation || '-',
    zoneMap.get(p.zoneId || '') || '-',
    p.pipeCode,
    p.pipeType,
    p.pipeDiameter || p.diameterInch || '-',
    p.sourceDeviceName || p.sourceLocation,
    p.targetDeviceName || p.targetLocation,
    p.lengthMeter || p.lengthMeters || 0,
    p.pathwayRoute || p.pathDescription || '-',
    p.status
  ]);

  const wsWater = XLSX.utils.aoa_to_sheet([
    ['LAPORAN DISTRIBUSI AIR & IRIGASI'],
    ['Tanggal Ekspor', exportDateStr],
    [],
    ['--- DAFTAR TITIK AIR & PERANGKAT (POMPA, TOREN, SOLENOID) ---'],
    waterDevHeaders,
    ...waterDevRows,
    [],
    ['--- DAFTAR JALUR PIPA DISTRIBUSI (PVC, HDPE, PPR) ---'],
    waterPipeHeaders,
    ...waterPipeRows
  ]);
  wsWater['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 20 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 28 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsWater, 'Jaringan AIR');

  // 7. SHEET DNS & DOMAIN
  if (dnsRecords.length > 0 || subDomains.length > 0) {
    const dnsHeaders = ['No', 'Domain / Host', 'Tipe DNS', 'Nilai / Target IP', 'TTL', 'Subnet Terkait', 'Status', 'Keterangan'];
    const dnsRows = dnsRecords.map((d, idx) => [
      idx + 1,
      d.domain,
      d.type,
      d.value,
      d.ttl,
      groupMap.get(d.groupId || '') || '-',
      d.status,
      d.description || '-'
    ]);

    const subHeaders = ['No', 'Subdomain', 'Target IP / Host', 'Port', 'Folder / Path', 'Deskripsi'];
    const subRows = subDomains.map((s, idx) => [
      idx + 1,
      s.subName,
      s.ipAddress || '-',
      s.port || '-',
      s.folder || '-',
      s.description || '-'
    ]);

    const wsDns = XLSX.utils.aoa_to_sheet([
      ['LAPORAN DNS & DOMAIN MANAGEMENT'],
      ['Tanggal Ekspor', exportDateStr],
      [],
      ['--- DAFTAR DNS RECORD ---'],
      dnsHeaders,
      ...dnsRows,
      [],
      ['--- DAFTAR SUBDOMAIN ---'],
      subHeaders,
      ...subRows
    ]);
    wsDns['!cols'] = [
      { wch: 6 }, { wch: 26 }, { wch: 12 }, { wch: 24 }, { wch: 10 }, { wch: 20 }, { wch: 14 }, { wch: 28 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsDns, 'DNS & Domain');
  }

  // Tulis file Excel tunggal
  const fileName = `Laporan_Infrastruktur_Jaringan_Lengkap_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Ekspor per grup subnet (dipertahankan untuk kompatibilitas jika dipanggil)
 */
export function exportToXlsx(
  group: IPGroup, 
  allocations: IPAllocation[], 
  services?: IPService[],
  categories?: DeviceCategory[]
): void {
  const headers = [
    'No',
    'Alamat IP',
    'Hostname',
    'Kategori Perangkat',
    'MAC Address',
    'PIC / Pengguna',
    'Departemen',
    'Status',
    'Layanan & Port',
    'Tanggal Alokasi',
    'Keterangan'
  ];

  const rows = allocations.map((a, idx) => {
    const itemServices = (services || []).filter(s => s.allocationId === a.id || s.ip === a.ip);
    const servicesStr = itemServices.length > 0 
      ? itemServices.map(s => `${s.name} (${s.port}/${s.protocol})`).join(', ')
      : '-';

    const raw = (a.deviceType || '').toLowerCase();
    const cleanRaw = raw.replace(/_/g, ' ');
    const cat = categories?.find(c => 
      c.id.toLowerCase() === raw || 
      c.name.toLowerCase() === raw ||
      c.id.toLowerCase().replace(/_/g, ' ') === cleanRaw ||
      c.name.toLowerCase().replace(/_/g, ' ') === cleanRaw
    );
    const categoryName = cat ? cat.name : (a.deviceType ? a.deviceType.replace(/_/g, ' ') : '-');

    return [
      idx + 1,
      a.ip,
      a.hostname,
      categoryName,
      a.macAddress || '-',
      a.assignedTo || '-',
      a.department || '-',
      a.status === 'used' ? 'Digunakan' : a.status === 'reserved' ? 'Reserved' : a.status === 'dhcp' ? 'DHCP Pool' : 'Bebas',
      servicesStr,
      a.assignedDate || '-',
      a.notes || '-'
    ];
  });

  const summaryRows = [
    ['LAPORAN ALOKASI IP HOST & INFRASTRUKTUR LAN'],
    ['Nama Subnet / Grup', group.name],
    ['CIDR Subnet', group.cidr],
    ['Gateway', group.gateway || '-'],
    ['Lokasi / Ruang', group.location || '-'],
    ['VLAN', group.vlanId ? `VLAN ${group.vlanId}` : '-'],
    ['PIC Subnet', group.pic || '-'],
    ['Tanggal Ekspor', new Date().toLocaleString('id-ID')],
    [],
    headers
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([...summaryRows, ...rows]);

  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // Alamat IP
    { wch: 24 }, // Hostname
    { wch: 18 }, // Tipe Perangkat
    { wch: 20 }, // MAC Address
    { wch: 22 }, // PIC / Pengguna
    { wch: 18 }, // Departemen
    { wch: 14 }, // Status
    { wch: 30 }, // Layanan & Port
    { wch: 16 }, // Tanggal Alokasi
    { wch: 32 }  // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  const safeSheetName = (group.name.replace(/[:\\/?*\[\]]/g, '').slice(0, 31)) || 'Alokasi IP';
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  const fileName = `Alokasi_IP_${group.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Backwards compatibility alias
export const exportToCsv = exportToXlsx;

/**
 * Ekspor seluruh basis data ke dalam satu berkas JSON lengkap
 */
export function exportBackupJson(
  groups: IPGroup[],
  allocations: IPAllocation[],
  categories?: DeviceCategory[],
  users?: UserAccount[],
  services?: IPService[],
  dnsRecords?: DnsRecord[],
  subDomains?: SubDomainRecord[],
  electricityDevices?: ElectricityDevice[],
  cctvDevices?: CctvDevice[],
  waterDevices?: WaterDevice[],
  soundDevices?: SoundDevice[],
  lanDevices?: LanDevice[],
  lanCables?: LanCableRun[],
  lanLocations?: LanLocation[],
  lanZones?: LanZone[],
  electricityCables?: ElectricityCableRun[],
  cctvCables?: CctvCableRun[],
  waterPipes?: WaterPipeRun[],
  soundCables?: SoundCableRun[],
  lanDeviceTypes?: any[],
  lanRoomTypes?: any[],
  lanCableTypes?: any[],
  electricityDeviceTypes?: any[],
  electricityCableTypes?: any[],
  cctvDeviceTypes?: any[],
  cctvCableTypes?: any[],
  waterDeviceTypes?: any[],
  soundDeviceTypes?: any[],
  waterPipeTypes?: any[],
  soundCableTypes?: any[],
  urlProtocols?: any[],
  dnsRecordTypes?: any[]
): void {
  const backupData = {
    appName: 'Infrastruktur Jaringan Terpadu (LAN, Listrik, CCTV, AIR)',
    version: '3.2.0',
    exportDate: new Date().toISOString(),
    totalData: {
      groups: groups.length,
      allocations: allocations.length,
      categories: categories?.length || 0,
      users: users?.length || 0,
      services: services?.length || 0,
      dnsRecords: dnsRecords?.length || 0,
      subDomains: subDomains?.length || 0,
      urlProtocols: urlProtocols?.length || 0,
      dnsRecordTypes: dnsRecordTypes?.length || 0,
      lanLocations: lanLocations?.length || 0,
      lanZones: lanZones?.length || 0,
      lanDevices: lanDevices?.length || 0,
      lanCables: lanCables?.length || 0,
      lanDeviceTypes: lanDeviceTypes?.length || 0,
      lanCableTypes: lanCableTypes?.length || 0,
      lanRoomTypes: lanRoomTypes?.length || 0,
      electricityDevices: electricityDevices?.length || 0,
      electricityDeviceTypes: electricityDeviceTypes?.length || 0,
      electricityCables: electricityCables?.length || 0,
      electricityCableTypes: electricityCableTypes?.length || 0,
      cctvDevices: cctvDevices?.length || 0,
      cctvDeviceTypes: cctvDeviceTypes?.length || 0,
      cctvCables: cctvCables?.length || 0,
      cctvCableTypes: cctvCableTypes?.length || 0,
      waterDevices: waterDevices?.length || 0,
      soundDevices: soundDevices?.length || 0,
      waterDeviceTypes: waterDeviceTypes?.length || 0,
      soundDeviceTypes: soundDeviceTypes?.length || 0,
      waterPipes: waterPipes?.length || 0,
      soundCables: soundCables?.length || 0,
      waterPipeTypes: waterPipeTypes?.length || 0,
      soundCableTypes: soundCableTypes?.length || 0
    },
    groups,
    allocations,
    categories: categories || [],
    users: users || [],
    services: services || [],
    dnsRecords: dnsRecords || [],
    subDomains: subDomains || [],
    urlProtocols: urlProtocols || [],
    dnsRecordTypes: dnsRecordTypes || [],
    lanLocations: lanLocations || [],
    lanZones: lanZones || [],
    lanDevices: lanDevices || [],
    lanCables: lanCables || [],
    lanDeviceTypes: lanDeviceTypes || [],
    lanCableTypes: lanCableTypes || [],
    lanRoomTypes: lanRoomTypes || [],
    electricityDevices: electricityDevices || [],
    electricityDeviceTypes: electricityDeviceTypes || [],
    electricityCables: electricityCables || [],
    electricityCableTypes: electricityCableTypes || [],
    cctvDevices: cctvDevices || [],
    cctvDeviceTypes: cctvDeviceTypes || [],
    cctvCables: cctvCables || [],
    cctvCableTypes: cctvCableTypes || [],
    waterDevices: waterDevices || [],
    soundDevices: soundDevices || [],
    waterDeviceTypes: waterDeviceTypes || [],
    soundDeviceTypes: soundDeviceTypes || [],
    waterPipes: waterPipes || [],
    soundCables: soundCables || [],
    waterPipeTypes: waterPipeTypes || [],
    soundCableTypes: soundCableTypes || []
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Cadangan_Infrastruktur_Jaringan_Lengkap_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportJson(fileContent: string): {
  groups: IPGroup[];
  allocations: IPAllocation[];
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
  waterPipes?: WaterPipeRun[];
  soundDevices?: SoundDevice[];
  soundCables?: SoundCableRun[];
  lanLocations?: LanLocation[];
  lanZones?: LanZone[];
  lanDevices?: LanDevice[];
  lanCables?: LanCableRun[];
  lanDeviceTypes?: any[];
  lanRoomTypes?: any[];
  lanCableTypes?: any[];
  electricityDeviceTypes?: any[];
  electricityCableTypes?: any[];
  cctvDeviceTypes?: any[];
  cctvCableTypes?: any[];
  waterDeviceTypes?: any[];
  soundDeviceTypes?: any[];
  waterPipeTypes?: any[];
  soundCableTypes?: any[];
} {
  const parsed = JSON.parse(fileContent);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Format berkas backup JSON tidak valid!');
  }
  return {
    groups: Array.isArray(parsed.groups) ? parsed.groups : [],
    allocations: Array.isArray(parsed.allocations) ? parsed.allocations : [],
    categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
    users: Array.isArray(parsed.users) ? parsed.users : undefined,
    services: Array.isArray(parsed.services) ? parsed.services : undefined,
    dnsRecords: Array.isArray(parsed.dnsRecords) ? parsed.dnsRecords : undefined,
    subDomains: Array.isArray(parsed.subDomains) ? parsed.subDomains : undefined,
    urlProtocols: Array.isArray(parsed.urlProtocols) ? parsed.urlProtocols : undefined,
    dnsRecordTypes: Array.isArray(parsed.dnsRecordTypes) ? parsed.dnsRecordTypes : undefined,
    electricityDevices: Array.isArray(parsed.electricityDevices) ? parsed.electricityDevices : undefined,
    electricityCables: Array.isArray(parsed.electricityCables) ? parsed.electricityCables : undefined,
    cctvDevices: Array.isArray(parsed.cctvDevices) ? parsed.cctvDevices : undefined,
    cctvCables: Array.isArray(parsed.cctvCables) ? parsed.cctvCables : undefined,
    waterDevices: Array.isArray(parsed.waterDevices) ? parsed.waterDevices : undefined,
    waterPipes: Array.isArray(parsed.waterPipes) ? parsed.waterPipes : undefined,
    lanLocations: Array.isArray(parsed.lanLocations) ? parsed.lanLocations : undefined,
    lanZones: Array.isArray(parsed.lanZones) ? parsed.lanZones : undefined,
    lanDevices: Array.isArray(parsed.lanDevices) ? parsed.lanDevices : undefined,
    lanCables: Array.isArray(parsed.lanCables) ? parsed.lanCables : undefined,
    lanDeviceTypes: Array.isArray(parsed.lanDeviceTypes) ? parsed.lanDeviceTypes : undefined,
    lanRoomTypes: Array.isArray(parsed.lanRoomTypes) ? parsed.lanRoomTypes : undefined,
    lanCableTypes: Array.isArray(parsed.lanCableTypes) ? parsed.lanCableTypes : undefined,
    electricityDeviceTypes: Array.isArray(parsed.electricityDeviceTypes) ? parsed.electricityDeviceTypes : undefined,
    electricityCableTypes: Array.isArray(parsed.electricityCableTypes) ? parsed.electricityCableTypes : undefined,
    cctvDeviceTypes: Array.isArray(parsed.cctvDeviceTypes) ? parsed.cctvDeviceTypes : undefined,
    cctvCableTypes: Array.isArray(parsed.cctvCableTypes) ? parsed.cctvCableTypes : undefined,
    waterDeviceTypes: Array.isArray(parsed.waterDeviceTypes) ? parsed.waterDeviceTypes : undefined,
    soundDeviceTypes: Array.isArray(parsed.soundDeviceTypes) ? parsed.soundDeviceTypes : undefined,
    waterPipeTypes: Array.isArray(parsed.waterPipeTypes) ? parsed.waterPipeTypes : undefined,
    soundCableTypes: Array.isArray(parsed.soundCableTypes) ? parsed.soundCableTypes : undefined,
    soundDevices: Array.isArray(parsed.soundDevices) ? parsed.soundDevices : undefined,
    soundCables: Array.isArray(parsed.soundCables) ? parsed.soundCables : undefined
  };
}
