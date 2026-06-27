import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Check } from 'lucide-react';
import { githubApi } from '../../lib/adminApi';
import { triggerToast } from './CmsToaster';

interface ImageUploadProps {
    value: string;
    onChange: (newValue: string) => void;
    label?: string;
    folder?: string;
}

export default function ImageUpload({ value, onChange, label, folder = 'public/assets/images/cms' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            triggerToast('Por favor, selecione uma imagem válida.', 'error');
            return;
        }

        setUploading(true);
        try {
            // Ler arquivo como Base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remover o prefixo "data:image/xxx;base64,"
                    resolve(result.split(',')[1]);
                };
                reader.readAsDataURL(file);
            });

            const base64Content = await base64Promise;

            // Gerar nome de arquivo limpo
            const timestamp = Date.now();
            const cleanName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
            const fileName = `${timestamp}-${cleanName}`;
            const fullPath = `${folder}/${fileName}`;

            // Enviar para o GitHub (ou filesystem local no dev)
            await githubApi('write', fullPath, {
                content: base64Content,
                isBase64: true,
                message: `Upload image: ${fileName} via CMS`
            });

            // O caminho final para o site deve ser relativo à raiz do site (geralmente sem o 'public/')
            const publicPath = fullPath.replace(/^public\//, '/');
            onChange(publicPath);
            triggerToast('Imagem enviada com sucesso!', 'success');
        } catch (err: any) {
            console.error('Upload error:', err);
            triggerToast('Erro ao enviar imagem: ' + err.message, 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-xs font-bold text-adm-ink-muted uppercase tracking-widest">{label}</label>}

            <div className="relative group">
                <div className="flex items-center gap-4 bg-white border border-adm-border p-3 rounded-xl transition-all hover:border-blue-300">
                    {/* Preview */}
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-adm-border overflow-hidden flex items-center justify-center shrink-0">
                        {value ? (
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                    </div>

                    {/* Input / Info */}
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="/assets/images/..."
                            className="w-full bg-transparent text-xs text-adm-ink-muted font-mono focus:outline-none mb-1 truncate"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                            {uploading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Upload className="w-3 h-3" />
                            )}
                            {uploading ? 'Enviando...' : 'Fazer Upload'}
                        </button>
                    </div>

                    {/* Clear Button */}
                    {value && (
                        <button
                            onClick={() => onChange('')}
                            className="p-1.5 text-adm-ink-faint hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            </div>
        </div>
    );
}
