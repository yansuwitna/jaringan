import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Layers, 
  Activity, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2,
  Upload,
  FileJson
} from 'lucide-react';
import { loginUser } from '../utils/autentikasi';
import { User, UserAccount } from '../types/auth';
import { parseImportJson } from '../utils/eksporImpor';
import { ModalRestore } from './ModalRestore';

interface LoginProps {
  users?: UserAccount[];
  hasNoUsers?: boolean;
  onLoginSuccess: (user: User) => void;
  onRegisterUser?: (userData: { 
    username: string; 
    name: string; 
    email: string; 
    password: string;
    appName?: string;
    appLogo?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  onImportData?: (data: any, isDemo?: boolean) => void;
  onBackToHome?: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  users = [],
  onLoginSuccess, 
  onRegisterUser,
  onImportData,
  onBackToHome, 
  hasNoUsers: propHasNoUsers 
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pendingRestoreData, setPendingRestoreData] = useState<any>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNoUsers, setHasNoUsers] = useState(propHasNoUsers ?? (users.length === 0));

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAppName, setRegAppName] = useState('');
  const [regAppLogo, setRegAppLogo] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (propHasNoUsers !== undefined) {
      setHasNoUsers(propHasNoUsers);
    } else {
      setHasNoUsers(users.length === 0);
    }
  }, [propHasNoUsers, users.length]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan kata sandi wajib diisi!');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(async () => {
      const res = await loginUser(username, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Autentikasi gagal! Periksa username & password.');
      }
    }, 300);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi!');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Username wajib diisi!');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('Kata sandi minimal 4 karakter!');
      return;
    }

    if (onRegisterUser) {
      const res = await onRegisterUser({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        appName: regAppName.trim() || undefined,
        appLogo: regAppLogo || undefined,
        avatar: regAvatar || undefined
      });

      if (!res.success || !res.user) {
        setRegError(res.error || 'Gagal membuat pengguna baru!');
        return;
      }

      setRegSuccess(`Pengguna "${res.user.username}" berhasil dibuat! Masuk otomatis...`);
      setHasNoUsers(false);

      setTimeout(async () => {
        const loginRes = await loginUser(res.user!.username, regPassword);
        if (loginRes.success && loginRes.user) {
          onLoginSuccess(loginRes.user);
        } else {
          setUsername(res.user!.username);
          setPassword(regPassword);
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/60 to-blue-100/50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-poppins">
      
      {/* Decorative Background Ornaments */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Login / Register Card */}
      <div className="w-full max-w-md relative z-10">

        {/* Back to Home Button (Centered) */}
        {onBackToHome && !hasNoUsers && (
          <div className="flex justify-center mb-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md shadow-red-600/25 transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Halaman Beranda (Home)</span>
            </button>
          </div>
        )}
        
        {/* Card Body */}
        <div className="bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-blue-500/10 transition-all">
          
          {hasNoUsers ? (
            /* OTOMATIS TAMPILKAN FORM PENDAFTARAN JIKA BELUM ADA USER */
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white rounded-2xl shadow-lg shadow-blue-500/30 mb-3 transform hover:scale-105 transition-transform">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Daftar Akun Pengguna
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Database akun belum memiliki pengguna. Daftarkan akun utama Anda untuk menggunakan sistem.
                </p>
              </div>

              {regError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Budi Hartono, S.Kom"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      placeholder="Contoh: admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Contoh: admin@corp.net"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Nama Aplikasi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Aplikasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={regAppName}
                    onChange={(e) => setRegAppName(e.target.value)}
                    placeholder="Contoh: NetIPAM SMK Negeri 1"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Upload Logo & Foto Profil Langsung Aktif */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Logo Aplikasi (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setRegAppLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-300 cursor-pointer text-slate-500"
                    />
                    {regAppLogo && (
                      <img src={regAppLogo} alt="Logo Preview" className="mt-1.5 h-8 object-contain rounded" />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Foto Profil / Avatar (Opsional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setRegAvatar(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-300 cursor-pointer text-slate-500"
                    />
                    {regAvatar && (
                      <img src={regAvatar} alt="Avatar Preview" className="mt-1.5 h-8 w-8 rounded-full object-cover border border-indigo-200" />
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 4 karakter"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun & Masuk</span>
                </button>

                {/* Option to Restore Backup when database is empty */}
                {onImportData && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 text-center">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      Sudah memiliki berkas cadangan (backup JSON)?
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const content = event.target?.result as string;
                            const parsed = parseImportJson(content);
                            setPendingRestoreData(parsed);
                            setIsRestoreModalOpen(true);
                          } catch (err: any) {
                            setRegError(err?.message || 'Berkas cadangan JSON tidak valid atau rusak!');
                          }
                        };
                        reader.readAsText(file);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Pulihkan / Restore dari Berkas Cadangan (.json)</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* TAMPILKAN FORM LOGIN JIKA SUDAH ADA USER */
            <div>
              {/* Logo & Header */}
              <div className="text-center mb-6">
                <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white rounded-2xl shadow-lg shadow-blue-500/30 mb-3 transform hover:scale-105 transition-transform">
                  <Network className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Selamat Datang
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Silakan login untuk mengakses sistem manajemen IP & DNS
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Username Akun
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Bottom Feature Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Kalkulator Subnet</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Inventaris IP Host</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Auto Free IP</span>
          </span>
        </div>

      </div>

      <ModalRestore 
        isOpen={isRestoreModalOpen} 
        pendingRestoreData={pendingRestoreData} 
        onClose={() => {
          setIsRestoreModalOpen(false);
          setPendingRestoreData(null);
        }} 
        onConfirm={(dataToRestore) => {
          onImportData?.(dataToRestore);
          setIsRestoreModalOpen(false);
          setPendingRestoreData(null);
          setRegSuccess('Data berhasil dipulihkan dari berkas cadangan! Silakan masuk dengan akun yang ada pada cadangan.');
          if (dataToRestore.users && dataToRestore.users.length > 0) {
            setHasNoUsers(false);
          }
        }} 
      />
    </div>
  );
};
