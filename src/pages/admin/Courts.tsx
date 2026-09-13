import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit3, Save, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useAdminStore } from '@/stores/adminStore';
import { formatCurrency } from '@/utils/format';
import { AMENITIES_LIST } from '@/utils/constants';
import type { Court } from '@/types';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function Courts() {
  const courts = useAdminStore((state) => state.courts);
  const loadingCourts = useAdminStore((state) => state.loadingCourts);
  const loadCourts = useAdminStore((state) => state.loadCourts);
  const updateCourt = useAdminStore((state) => state.updateCourt);

  const [editing, setEditing] = useState<Court | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCourts();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateCourt(editing);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (!editing) return;
    const has = editing.amenities.includes(amenity);
    setEditing({
      ...editing,
      amenities: has
        ? editing.amenities.filter((a) => a !== amenity)
        : [...editing.amenities, amenity],
    });
  };

  const getImageUrl = (court: Court): string => {
    return (
      court?.image ||
      court?.image_url ||
      'https://images.pexels.com/photos/17299530/pexels-photo-17299530.jpeg?auto=compress&cs=tinysrgb&w=1200'
    );
  };

  return (
    <AdminLayout>
      <div className="container-page py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Courts Management
          </h1>
          <p className="mt-1 text-xs text-cream-muted sm:text-sm">
            Manage court details, pricing, and amenities
          </p>
        </div>

        {loadingCourts ? (
          <LoadingSpinner className="py-12" />
        ) : courts.length === 0 ? (
          <div className="card py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-cream-muted/40" />
            <p className="mt-4 text-sm text-cream-muted">No courts found for this client.</p>
            <p className="text-xs text-cream-muted/60">Add a court to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court, i) => {
              if (!court) return null;

              return (
                <motion.div
                  key={court.id || `court-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card overflow-hidden"
                >
                  <div className="relative h-36 overflow-hidden sm:h-40">
                    <img
                      src={getImageUrl(court)}
                      alt={court?.name || 'Court'}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.pexels.com/photos/17299530/pexels-photo-17299530.jpeg?auto=compress&cs=tinysrgb&w=1200';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={`badge ${
                          court?.is_active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                        }`}
                      >
                        {court?.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-bold text-cream sm:text-lg">
                      {court?.name || 'Unnamed Court'}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-cream-muted">
                      {court?.description || 'No description'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(court?.amenities || []).slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="rounded-md bg-forest-600 px-2 py-0.5 text-[10px] text-cream-muted"
                        >
                          {a}
                        </span>
                      ))}
                      {(court?.amenities || []).length > 4 && (
                        <span className="rounded-md bg-forest-600 px-2 py-0.5 text-[10px] text-cream-muted">
                          +{(court?.amenities || []).length - 4}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-forest-500 pt-3">
                      <div>
                        <p className="text-[10px] text-cream-muted">Off-Peak</p>
                        <p className="text-sm font-bold text-gold-400">
                          {formatCurrency(court?.price_per_hour || 0)}/hr
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-cream-muted">Peak</p>
                        <p className="text-sm font-bold text-gold-400">
                          {formatCurrency(court?.peak_price_per_hour || 0)}/hr
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-cream-muted">
                      Hours: {court?.open_time || 'N/A'} - {court?.close_time || 'N/A'}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      fullWidth
                      className="mt-3"
                      leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                      onClick={() => court && setEditing({ ...court })}
                      disabled={!court}
                    >
                      Edit Court
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          title={`Edit ${editing?.name || 'Court'}`}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Court Name"
              value={editing?.name || ''}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <Textarea
              label="Description"
              rows={2}
              value={editing?.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Price per Hour (Off-Peak)"
                type="number"
                value={editing?.price_per_hour || 0}
                onChange={(e) =>
                  setEditing({ ...editing, price_per_hour: Number(e.target.value) })
                }
              />
              <Input
                label="Peak Price per Hour"
                type="number"
                value={editing?.peak_price_per_hour || 0}
                onChange={(e) =>
                  setEditing({ ...editing, peak_price_per_hour: Number(e.target.value) })
                }
              />
              <Input
                label="Opening Time"
                type="time"
                value={editing?.open_time || '08:00'}
                onChange={(e) => setEditing({ ...editing, open_time: e.target.value })}
              />
              <Input
                label="Closing Time"
                type="time"
                value={editing?.close_time || '22:00'}
                onChange={(e) => setEditing({ ...editing, close_time: e.target.value })}
              />
            </div>
            <ImageUpload
              label="Court Image"
              value={editing?.image || editing?.image_url || ''}
              onChange={(url) => setEditing({ ...editing, image: url, image_url: url })}
              folder="courts"
            />
            <Input
              label="Surface Type"
              value={editing?.surface || ''}
              onChange={(e) => setEditing({ ...editing, surface: e.target.value })}
            />
            <div>
              <p className="mb-2 text-sm font-medium text-cream">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      editing?.amenities?.includes(a) || false
                        ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                        : 'border-forest-500 text-cream-muted hover:border-gold-400/40'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-cream">
                <input
                  type="checkbox"
                  checked={editing?.is_indoor || false}
                  onChange={(e) => setEditing({ ...editing, is_indoor: e.target.checked })}
                  className="h-4 w-4 accent-gold-400"
                />
                Indoor Court
              </label>
              <label className="flex items-center gap-2 text-sm text-cream">
                <input
                  type="checkbox"
                  checked={editing?.is_active || false}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  className="h-4 w-4 accent-gold-400"
                />
                Active (bookable)
              </label>
            </div>

            {/* Sticky modal footer on mobile */}
            <div className="sticky bottom-0 -mx-4 -mb-4 mt-4 border-t border-forest-500 bg-forest-900/95 p-4 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:bg-transparent sm:p-0 sm:pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  size="md"
                  fullWidth
                  isLoading={saving}
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  fullWidth
                  className="sm:w-auto"
                  onClick={() => setEditing(null)}
                >
                  <X className="h-4 w-4" />
                  <span className="ml-2 sm:hidden">Cancel</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}