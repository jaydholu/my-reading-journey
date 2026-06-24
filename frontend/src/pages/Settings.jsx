import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Lock, CalendarDays, MapPin, Globe, Heart,
  BookOpen, Target, Image, Trash2, Save, Download, Shield,
  Eye, Database, SlidersHorizontal
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { GENDERS, MAX_FILE_SIZE } from '../utils/constants';


const SettingsCard = ({ title, icon: Icon, children }) => (
  <div className="card p-5 sm:p-6 space-y-4 sm:space-y-5">
    <div>
      <h3 className="font-serif font-semibold text-lg sm:text-xl text-dark-900 dark:text-dark-50 flex items-center gap-2">
        {Icon && <Icon size={20} className="text-primary-600 dark:text-primary-400" />}
        {title}
      </h3>
      <div className="accent-rule mt-2" />
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user, logout, updateProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '', user_name: '', email: '', bio: '',
    birthdate: '', gender: '', country: '', city: '',
    favorite_genre: '', favorite_book: '', reading_goal: '', hobbies: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '', new_password: '', confirm_password: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/users/me');
      setProfileData({
        full_name: response.data.full_name || '',
        user_name: response.data.user_name || '',
        email: response.data.email || '',
        bio: response.data.bio || '',
        birthdate: response.data.birthdate ? response.data.birthdate.split('T')[0] : '',
        gender: response.data.gender || '',
        country: response.data.country || '',
        city: response.data.city || '',
        favorite_genre: response.data.favorite_genre || '',
        favorite_book: response.data.favorite_book || '',
        reading_goal: response.data.reading_goal || '',
        hobbies: response.data.hobbies || '',
      });
      setProfilePicturePreview(response.data.profile_picture);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) { toast.error('File size must be under 10MB'); return; }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = () => setProfilePicturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/me', profileData);
      if (profilePicture) {
        const formData = new FormData();
        formData.append('file', profilePicture);
        await api.post('/users/me/picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      await updateProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match'); return;
    }
    setSaving(true);
    try {
      await api.put('/users/me/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      toast.success('Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await api.delete('/users/me/picture');
      setProfilePicture(null);
      setProfilePicturePreview(null);
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error('Failed to remove profile picture');
    }
  };

  const handleExportData = async (format) => {
    try {
      const response = await api.get(`/data/export/user/${format}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_data_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/users/me/delete');
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading settings..." />;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'danger', label: 'Account', icon: Trash2 },
  ];

  return (
    // REDESIGN: plain cream background
    <div className="min-h-screen mt-16 bg-dark-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="accent-rule mb-3" />
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-dark-900 dark:text-dark-50">Settings</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm sm:text-base mt-1">Manage your account preferences and settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Tab navigation */}
          <div className="lg:col-span-1">
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    // REDESIGN: active = solid dark-900 text + bottom border; no gradient pill
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-white dark:bg-dark-800 border border-dark-900 dark:border-dark-50 text-dark-900 dark:text-dark-50 shadow-sm'
                        : 'bg-white dark:bg-dark-900 text-dark-500 dark:text-dark-400 border border-dark-200 dark:border-dark-700 hover:border-dark-300 dark:hover:border-dark-600'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:block card p-3 space-y-1 sticky top-20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.98 }}
                    // REDESIGN: active = filled dark-900/cream with hairline border, not gradient
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-dark-900 dark:bg-dark-50 text-white dark:text-dark-900'
                        : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">

                  {/* Profile Picture */}
                  <SettingsCard title="Profile Picture" icon={Eye}>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-dark-200 dark:border-dark-700">
                          {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 text-4xl font-serif font-semibold">
                              {profileData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                        <input type="file" id="profile-picture" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                          <Button type="button" variant="primary" icon={Image} onClick={() => document.getElementById('profile-picture').click()}>
                            Upload Photo
                          </Button>
                          {profilePicturePreview && (
                            <Button type="button" variant="ghost" icon={Trash2} onClick={handleDeleteProfilePicture}>Remove</Button>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">JPG, PNG or GIF. Maximum size 10MB</p>
                      </div>
                    </div>
                  </SettingsCard>

                  {/* Basic Info */}
                  <SettingsCard title="Basic Information" icon={User}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <Input label="Full Name" name="full_name" value={profileData.full_name} onChange={handleProfileChange} placeholder="John Doe" />
                      <Input label="Username" name="user_name" value={profileData.user_name} disabled placeholder="johndoe" />
                    </div>
                    <Input label="Email Address" name="email" type="email" value={profileData.email} disabled placeholder="you@example.com" />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Bio</label>
                      <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows={4} placeholder="Tell us about yourself..." className="input-field resize-none" />
                      <p className="text-xs text-dark-400 dark:text-dark-500 text-right">{profileData.bio.length}/500</p>
                    </div>
                  </SettingsCard>

                  {/* Personal Details */}
                  <SettingsCard title="Personal Details" icon={Globe}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <Input label="Birth Date" name="birthdate" type="date" icon={CalendarDays} value={profileData.birthdate} onChange={handleProfileChange} />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Gender</label>
                        <select name="gender" value={profileData.gender} onChange={handleProfileChange} className="input-field">
                          <option value="">Select gender</option>
                          {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                      </div>
                      <Input label="Country" name="country" icon={Globe} value={profileData.country} onChange={handleProfileChange} placeholder="United States" />
                      <Input label="City" name="city" icon={MapPin} value={profileData.city} onChange={handleProfileChange} placeholder="New York" />
                    </div>
                  </SettingsCard>

                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" icon={Save} loading={saving} size="lg" className="w-full sm:w-auto">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                  <SettingsCard title="Reading Preferences" icon={BookOpen}>
                    <Input label="Favorite Genre" name="favorite_genre" value={profileData.favorite_genre} onChange={handleProfileChange} placeholder="e.g., Science Fiction" />
                    <Input label="Favorite Book" name="favorite_book" value={profileData.favorite_book} onChange={handleProfileChange} placeholder="e.g., 1984 by George Orwell" />
                    <Input label="Annual Reading Goal" name="reading_goal" type="number" icon={Target} value={profileData.reading_goal} onChange={handleProfileChange} placeholder="e.g., 24 books per year" />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Other Hobbies & Interests</label>
                      <textarea name="hobbies" value={profileData.hobbies} onChange={handleProfileChange} rows={3} placeholder="Share your other interests..." className="input-field resize-none" />
                    </div>
                  </SettingsCard>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" icon={Save} loading={saving} size="lg" className="w-full sm:w-auto">
                      Save Preferences
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                  <SettingsCard title="Change Password" icon={Lock}>
                    <Input label="Current Password" name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} placeholder="Enter current password" />
                    <Input label="New Password" name="new_password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} placeholder="Enter new password" />
                    <Input label="Confirm New Password" name="confirm_password" type="password" value={passwordData.confirm_password} onChange={handlePasswordChange} placeholder="Confirm new password" />
                    <div className="p-4 bg-dark-50 dark:bg-dark-900 rounded-xl border border-dark-200 dark:border-dark-700">
                      <p className="text-sm text-dark-700 dark:text-dark-300 font-medium mb-2">Password Requirements:</p>
                      <ul className="text-xs text-dark-500 dark:text-dark-400 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Contains uppercase and lowercase letters</li>
                        <li>• Includes at least one number</li>
                      </ul>
                    </div>
                  </SettingsCard>
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" icon={Save} loading={saving} size="lg" className="w-full sm:w-auto">
                      Update Password
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                <SettingsCard title="Export Your Data" icon={Download}>
                  <p className="text-dark-500 dark:text-dark-400 text-sm sm:text-base">
                    Download a copy of your data including profile information, books, and wishlist.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { format: 'json', label: 'JSON Format', desc: 'Complete data with all fields' },
                      { format: 'csv', label: 'CSV Format', desc: 'Profile data for spreadsheets' },
                    ].map(({ format, label, desc }) => (
                      <button key={format} onClick={() => handleExportData(format)}
                        className="p-4 sm:p-5 rounded-xl border border-dark-200 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 text-left group bg-white dark:bg-dark-900">
                        <div className="flex items-center justify-between mb-3">
                          <Database className="text-primary-600 dark:text-primary-400" size={20} />
                          <Download className="text-dark-300 dark:text-dark-600 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" size={16} />
                        </div>
                        <h4 className="font-semibold text-dark-900 dark:text-dark-50 mb-1 text-sm sm:text-base">{label}</h4>
                        <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">{desc}</p>
                      </button>
                    ))}
                  </div>
                </SettingsCard>

                <SettingsCard title="Privacy Information" icon={Shield}>
                  <ul className="space-y-2 text-xs sm:text-sm text-dark-600 dark:text-dark-400">
                    <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span>Your data is encrypted and securely stored</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span>We never share your personal information with third parties</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span>You can export or delete your data at any time</span></li>
                    <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span>Read our <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a> for more details</span></li>
                  </ul>
                </SettingsCard>
              </motion.div>
            )}

            {/* Danger Zone / Account Tab */}
            {activeTab === 'danger' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card p-5 sm:p-6 border border-red-200 dark:border-red-900">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="text-red-600 dark:text-red-400" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-lg sm:text-xl text-red-600 dark:text-red-400 mb-1">Delete Account</h3>
                        <p className="text-dark-600 dark:text-dark-400 text-sm sm:text-base">Permanently delete your account and all associated data.</p>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Shield size={15} /> This action will permanently:
                      </h4>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-red-700 dark:text-red-300">
                        <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Delete all your books and reading data</span></li>
                        <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Remove your profile and account information</span></li>
                        <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span>Delete your wishlist items</span></li>
                        <li className="flex items-start gap-2"><span className="mt-0.5">•</span><span className="font-semibold">This action cannot be undone</span></li>
                      </ul>
                    </div>
                    <Button variant="danger" icon={Trash2} onClick={() => setShowDeleteDialog(true)} size="lg" className="w-full sm:w-auto">
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        message="Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted."
        confirmText="Delete My Account"
        cancelText="Cancel"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default Settings;
