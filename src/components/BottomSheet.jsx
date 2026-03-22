/**
 * BottomSheet — a mobile-native bottom sheet component for selection lists.
 * Replaces <Select> inside dialogs/forms to avoid nested portal issues on mobile.
 *
 * Usage:
 *   <BottomSheet
 *     value={form.category}
 *     onValueChange={v => setForm({...form, category: v})}
 *     options={[{ value: 'a', label: 'Option A' }]}
 *     placeholder="Pick one"
 *   />
 */
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Check, ChevronDown } from 'lucide-react';

export default function BottomSheet({ value, onValueChange, options = [], placeholder = 'Select…', label, disabled }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent/40 focus:outline-none disabled:opacity-50"
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="fixed bottom-0 left-0 right-0 max-w-none rounded-t-2xl rounded-b-none p-0 translate-y-0 top-auto data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom"
          style={{ margin: 0 }}
        >
          {label && (
            <div className="px-4 pt-4 pb-2 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{label}</p>
            </div>
          )}
          <div className="overflow-y-auto max-h-72 py-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-accent/50 active:bg-accent transition-colors"
                onClick={() => { onValueChange(opt.value); setOpen(false); }}
              >
                <span className={opt.value === value ? 'font-semibold text-primary' : 'text-foreground'}>
                  {opt.label}
                </span>
                {opt.value === value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}