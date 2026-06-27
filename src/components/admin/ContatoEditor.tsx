import React, { useState, useEffect } from 'react';
import { Save, Loader2, LayoutTemplate, Plus, X } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

const FILE_PATH = 'src/data/contato.json';

const DEFAULT: any = {
    hero: { title: 'Contato', subtitle: 'Fale Conosco', bgImage: '' },
    info: { address: '', email: '', phone: '', title: '', description: '', mapUrl: '', formServices: [] as string[] },
    seo: { title: '', description: '' },
};

export default function ContatoEditor() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<any>(null);
    const [fileSha, setFileSha] = useState('');
    const [pendingUpload, setPendingUpload] = useState<File | null>(null);

    useEffect(() => {
        githubApi('read', FILE_PATH)
            .then((d: any) => {
                const parsed = JSON.parse(d?.content || '{}');
                const merged: any = {};
                Object.keys(DEFAULT).forEach(k => { merged[k] = { ...DEFAULT[k], ...(parsed[k] || {}) }; });
                setData(merged);
                setFileSha(d.sha);
            })
            .catch(err => { setError(err.message); setData(DEFAULT); })
            .finally(() => setLoading(false));
    }, []);

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(',')[1]);
        r.onerror = reject;
        r.readAsDataURL(file);
    });

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true); setError('');
        triggerToast('Salvando Contato...', 'progress', 20);
        try {
            const final = JSON.parse(JSON.stringify(data));
            if (pendingUpload) {
                const b64 = await fileToBase64(pendingUpload);
                const ghPath = `public/uploads/${Date.now()}-contato-bg.${pendingUpload.name.split('.').pop() || 'jpg'}`;
                await githubApi('write', ghPath, { content: b64, isBase64: true, message: 'Upload contato bg' });
                final.hero.bgImage = ghPath.replace('public', '');
            }
            const res = await githubApi('write', FILE_PATH, { content: JSON.stringify(final, null, 2), sha: fileSha, message: 'CMS: Pagina Contato atualizada' });
            setFileSha(res.sha); setData(final); setPendingUpload(null);
            triggerToast('Pagina Contato atualizada!', 'success', 100);
        } catch (err: any) { setError(err.message); triggerToast(`Erro: ${err.message}`, 'error'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-adm-ink-faint bg-white rounded-2xl border border-adm-border">
            <LayoutTemplate className="w-10 h-10 animate-pulse mb-6 text-slate-300" />
            <p className="font-semibold text-sm animate-pulse text-adm-ink-muted">Buscando contato.json...</p>
        </div>
    );

    const cardClass = "p-8 mb-6 bg-white border border-adm-border rounded-2xl shadow-sm";
    const inputClass = "w-full bg-white border border-adm-border rounded-xl px-4 py-3 text-sm font-medium text-adm-ink focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-adm-primary/25 transition-all shadow-sm";
    const labelClass = "block text-sm font-bold text-adm-ink-muted uppercase tracking-wider mb-2 ml-1";
    const subInputClass = "w-full bg-white border border-adm-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500";

    const setF = (sec: string, key: string, value: any) => setData((d: any) => ({ ...d, [sec]: { ...d[sec], [key]: value } }));

    return (
        <div className="max-w-4xl space-y-0 pb-32">
            <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-adm-border shadow-sm mb-6 sticky top-4 z-10">
                <div>
                    <h2 className="text-lg font-bold text-adm-ink">Editar Pagina: Contato</h2>
                    <p className="text-xs text-adm-ink-muted mt-0.5">Edita o arquivo <code className="bg-slate-100 px-1 rounded">{FILE_PATH}</code></p>
                </div>
                <button onClick={handleSave} disabled={saving} className="bg-adm-primary hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 text-sm font-medium mb-4">{error}</div>}

            <form onSubmit={handleSave} className="space-y-6">
                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">1. Banner do Topo (Hero)</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Titulo</label><input type="text" value={data?.hero?.title || ''} onChange={e => setF('hero', 'title', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Subtitulo</label><input type="text" value={data?.hero?.subtitle || ''} onChange={e => setF('hero', 'subtitle', e.target.value)} className={inputClass} /></div>
                        </div>
                        <div className="bg-adm-bg p-4 border border-adm-border rounded-xl">
                            <label className={labelClass}>Imagem de fundo</label>
                            <input type="file" accept="image/*" className="text-sm" onChange={e => { const f = e.target.files?.[0]; if (f) { setPendingUpload(f); setF('hero', 'bgImage', URL.createObjectURL(f)); } e.target.value = ''; }} />
                            {data?.hero?.bgImage && <div className="mt-3 w-full h-[200px] border border-slate-300 rounded overflow-hidden"><img src={data.hero.bgImage} className="w-full h-full object-cover" /></div>}
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">2. Informacoes de Contato</h3>
                    <p className="text-xs text-adm-ink-muted mb-4">Aceitam HTML <code>&lt;br/&gt;</code> para quebrar linha. Se ficarem vazios, sao usados os valores de Configuracoes.</p>
                    <div className="space-y-4">
                        <div><label className={labelClass}>Endereco</label><textarea rows={2} value={data?.info?.address || ''} onChange={e => setF('info', 'address', e.target.value)} className={`${inputClass} resize-y`} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelClass}>E-mail</label><input type="text" value={data?.info?.email || ''} onChange={e => setF('info', 'email', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Telefone / WhatsApp</label><input type="text" value={data?.info?.phone || ''} onChange={e => setF('info', 'phone', e.target.value)} className={inputClass} /></div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">3. Bloco do Formulario</h3>
                    <div className="space-y-4">
                        <div><label className={labelClass}>Titulo do bloco</label><input type="text" value={data?.info?.title || ''} onChange={e => setF('info', 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Descricao</label><textarea rows={3} value={data?.info?.description || ''} onChange={e => setF('info', 'description', e.target.value)} className={`${inputClass} resize-y`} /></div>
                        <div>
                            <label className={labelClass}>Servicos no select do formulario</label>
                            <div className="space-y-2">
                                {(data?.info?.formServices || []).map((s: string, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <input type="text" value={s} onChange={e => { const arr = [...data.info.formServices]; arr[i] = e.target.value; setF('info', 'formServices', arr); }} className={subInputClass} />
                                        <button type="button" onClick={() => setF('info', 'formServices', data.info.formServices.filter((_: any, j: number) => j !== i))} className="px-2 py-1 text-red-500"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setF('info', 'formServices', [...(data?.info?.formServices || []), ''])} className="text-sm font-bold text-adm-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">4. Mapa do Google</h3>
                    <div>
                        <label className={labelClass}>URL do iframe (Google Maps Embed)</label>
                        <input type="text" placeholder="https://www.google.com/maps/embed?pb=..." value={data?.info?.mapUrl || ''} onChange={e => setF('info', 'mapUrl', e.target.value)} className={`${inputClass} font-mono text-xs`} />
                        <p className="text-xs text-adm-ink-faint mt-1">Google Maps &rarr; Compartilhar &rarr; Incorporar mapa &rarr; copie a URL do <code>src=""</code></p>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">SEO</h3>
                    <div className="space-y-4">
                        <div><label className={labelClass}>Titulo SEO</label><input type="text" value={data?.seo?.title || ''} onChange={e => setF('seo', 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Meta descricao</label><textarea rows={3} value={data?.seo?.description || ''} onChange={e => setF('seo', 'description', e.target.value)} className={`${inputClass} resize-y`} /></div>
                    </div>
                </div>
            </form>
        </div>
    );
}
