import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, X, FileText, Image } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function FileUploader({ onUpload, accept = "*", multiple = false, label = "Upload file", existingUrls = [] }) {
  const [uploading, setUploading] = useState(false);
  const [urls, setUrls] = useState(existingUrls);
  const inputRef = useRef();

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const newUrls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newUrls.push(file_url);
    }
    const all = [...urls, ...newUrls];
    setUrls(all);
    onUpload(multiple ? all : all[all.length - 1]);
    setUploading(false);
    inputRef.current.value = '';
  };

  const removeUrl = (idx) => {
    const next = urls.filter((_, i) => i !== idx);
    setUrls(next);
    onUpload(multiple ? next : next[0] || '');
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleFiles} />
      <Button type="button" variant="outline" className="w-full gap-2" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading...' : label}
      </Button>
      {urls.length > 0 && (
        <div className="space-y-1">
          {urls.map((url, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
              {url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? <Image className="w-4 h-4 text-muted-foreground shrink-0" /> : <FileText className="w-4 h-4 text-muted-foreground shrink-0" />}
              <a href={url} target="_blank" rel="noopener" className="truncate flex-1 text-primary hover:underline">
                {url.split('/').pop()}
              </a>
              <button type="button" onClick={() => removeUrl(i)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}