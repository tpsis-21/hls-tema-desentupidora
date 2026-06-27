import React, { useState, useEffect } from 'react';
import { Save, Loader2, LayoutTemplate, Plus, X } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

const FILE_PATH = 'src/data/sobre.json';

const DEFAULT: any = {
    hero: { title: 'Sobre Nós', subtitle: '', bgImage: '' },
    about: { image: '', title: '', content: '', signatureImage: '', authorName: '', authorRole: '' },
    services: { title: '', description: '', items: [] },
    funFacts: { backgroundImage: '', items: [] },
    testimonials: { title: '', subtitle: '', description: '', items: [] },
};

export default function SobreEditor() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<any>(null);
    const [fileSha, setFileSha] = useState('');
    const [pendingUploads, setPendingUploads] = useState<Record<string, File>>({});

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
        triggerToast('Salvando Sobre...', 'progress', 20);
        try {
            const final = JSON.parse(JSON.stringify(data));
            for (const [key, file] of Object.entries(pendingUploads)) {
                const b64 = await fileToBase64(file);
                const ghPath = `public/uploads/${Date.now()}-${key.replace(/\./g, '-')}.${file.name.split('.').pop() || 'jpg'}`;
                await githubApi('write', ghPath, { content: b64, isBase64: true, message: `Upload ${key}` });
                const url = ghPath.replace('public', '');
                const [section, field] = key.split('.');
                if (final[section]) final[section][field] = url;
            }
            const res = await githubApi('write', FILE_PATH, { content: JSON.stringify(final, null, 2), sha: fileSha, message: 'CMS: Pagina Sobre atualizada' });
            setFileSha(res.sha); setData(final); setPendingUploads({});
            triggerToast('Pagina Sobre atualizada!', 'success', 100);
        } catch (err: any) { setError(err.message); triggerToast(`Erro: ${err.message}`, 'error'); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-32 text-adm-ink-faint bg-white rounded-2xl border border-adm-border">
            <LayoutTemplate className="w-10 h-10 animate-pulse mb-6 text-slate-300" />
            <p className="font-semibold text-sm animate-pulse text-adm-ink-muted">Buscando sobre.json...</p>
        </div>
    );

    const cardClass = "p-8 mb-6 bg-white border border-adm-border rounded-2xl shadow-sm";
    const inputClass = "w-full bg-white border border-adm-border rounded-xl px-4 py-3 text-sm font-medium text-adm-ink focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-adm-primary/25 transition-all shadow-sm";
    const labelClass = "block text-sm font-bold text-adm-ink-muted uppercase tracking-wider mb-2 ml-1";
    const subInputClass = "w-full bg-white border border-adm-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500";

    const setF = (sec: string, key: string, value: any) => setData((d: any) => ({ ...d, [sec]: { ...d[sec], [key]: value } }));
    const setArr = (sec: string, idx: number, field: string, value: any) => setData((d: any) => {
        const arr = [...(d[sec].items || [])];
        arr[idx] = { ...(arr[idx] || {}), [field]: value };
        return { ...d, [sec]: { ...d[sec], items: arr } };
    });
    const addItem = (sec: string, item: any) => setData((d: any) => ({ ...d, [sec]: { ...d[sec], items: [...(d[sec].items || []), item] } }));
    const rmItem = (sec: string, idx: number) => setData((d: any) => ({ ...d, [sec]: { ...d[sec], items: d[sec].items.filter((_: any, i: number) => i !== idx) } }));

    const onFile = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (!f) return;
        setPendingUploads(p => ({ ...p, [key]: f }));
        const [sec, field] = key.split('.');
        setF(sec, field, URL.createObjectURL(f));
        e.target.value = '';
    };

    return (
        <div className="max-w-4xl space-y-0 pb-32">
            <div className="flex items-center justify-between bg-white p-4 px-6 rounded-2xl border border-adm-border shadow-sm mb-6 sticky top-4 z-10">
                <div>
                    <h2 className="text-lg font-bold text-adm-ink">Editar Pagina: Sobre Nos</h2>
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
                            <input type="file" accept="image/*" onChange={onFile('hero.bgImage')} className="text-sm" />
                            {data?.hero?.bgImage && <div className="mt-3 w-full h-[200px] border border-slate-300 rounded overflow-hidden"><img src={data.hero.bgImage} className="w-full h-full object-cover" /></div>}
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">2. Sobre a Empresa</h3>
                    <div className="space-y-4">
                        <div><label className={labelClass}>Titulo</label><input type="text" value={data?.about?.title || ''} onChange={e => setF('about', 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Descricao (HTML permitido)</label><textarea rows={6} value={data?.about?.content || ''} onChange={e => setF('about', 'content', e.target.value)} className={`${inputClass} resize-y`} /></div>
                        <div className="bg-adm-bg p-4 border border-adm-border rounded-xl">
                            <label className={labelClass}>Imagem da empresa</label>
                            <input type="file" accept="image/*" onChange={onFile('about.image')} className="text-sm" />
                            {data?.about?.image && <div className="mt-3 w-full h-[200px] border border-slate-300 rounded overflow-hidden"><img src={data.about.image} className="w-full h-full object-cover" /></div>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Nome do responsavel</label><input type="text" value={data?.about?.authorName || ''} onChange={e => setF('about', 'authorName', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Cargo</label><input type="text" value={data?.about?.authorRole || ''} onChange={e => setF('about', 'authorRole', e.target.value)} className={inputClass} /></div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">3. Diferenciais (Services)</h3>
                    <div className="space-y-4">
                        <div><label className={labelClass}>Titulo</label><input type="text" value={data?.services?.title || ''} onChange={e => setF('services', 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Descricao</label><textarea rows={3} value={data?.services?.description || ''} onChange={e => setF('services', 'description', e.target.value)} className={`${inputClass} resize-y`} /></div>
                        <div>
                            <label className={labelClass}>Items</label>
                            <div className="space-y-2">
                                {(data?.services?.items || []).map((it: any, i: number) => (
                                    <div key={i} className="border border-adm-border rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-center"><strong className="text-xs text-adm-ink-muted">Item {i + 1}</strong><button type="button" onClick={() => rmItem('services', i)} className="text-red-500"><X className="w-4 h-4" /></button></div>
                                        <input type="text" placeholder="Titulo" value={it.title || ''} onChange={e => setArr('services', i, 'title', e.target.value)} className={subInputClass} />
                                        <textarea rows={2} placeholder="Descricao" value={it.description || ''} onChange={e => setArr('services', i, 'description', e.target.value)} className={`${subInputClass} resize-y`} />
                                        <input type="text" placeholder="Icon (ex: Clock, Users, Verified)" value={it.icon || ''} onChange={e => setArr('services', i, 'icon', e.target.value)} className={`${subInputClass} font-mono`} />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addItem('services', { title: '', description: '', icon: 'Clock' })} className="text-sm font-bold text-adm-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">4. Numeros (Fun Facts)</h3>
                    <div className="space-y-4">
                        <div className="bg-adm-bg p-4 border border-adm-border rounded-xl">
                            <label className={labelClass}>Imagem de fundo</label>
                            <input type="file" accept="image/*" onChange={onFile('funFacts.backgroundImage')} className="text-sm" />
                            {data?.funFacts?.backgroundImage && <div className="mt-3 w-full h-[120px] border border-slate-300 rounded overflow-hidden"><img src={data.funFacts.backgroundImage} className="w-full h-full object-cover" /></div>}
                        </div>
                        <div>
                            <label className={labelClass}>Estatisticas</label>
                            <div className="space-y-2">
                                {(data?.funFacts?.items || []).map((it: any, i: number) => (
                                    <div key={i} className="border border-adm-border rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-center"><strong className="text-xs text-adm-ink-muted">Item {i + 1}</strong><button type="button" onClick={() => rmItem('funFacts', i)} className="text-red-500"><X className="w-4 h-4" /></button></div>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="Numero" value={it.count || ''} onChange={e => setArr('funFacts', i, 'count', e.target.value)} className={`${subInputClass} w-32`} />
                                            <input type="text" placeholder="Sufixo (+, /7, %)" value={it.suffix || ''} onChange={e => setArr('funFacts', i, 'suffix', e.target.value)} className={`${subInputClass} w-32`} />
                                            <input type="text" placeholder="Texto" value={it.label || ''} onChange={e => setArr('funFacts', i, 'label', e.target.value)} className={`${subInputClass} flex-1`} />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addItem('funFacts', { count: '', label: '', icon: '/assets/images/icon/9.png' })} className="text-sm font-bold text-adm-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-adm-border pb-4">5. Depoimentos</h3>
                    <div className="space-y-4">
                        <div><label className={labelClass}>Titulo</label><input type="text" value={data?.testimonials?.title || ''} onChange={e => setF('testimonials', 'title', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Subtitulo</label><input type="text" value={data?.testimonials?.subtitle || ''} onChange={e => setF('testimonials', 'subtitle', e.target.value)} className={inputClass} /></div>
                        <div><label className={labelClass}>Descricao</label><textarea rows={2} value={data?.testimonials?.description || ''} onChange={e => setF('testimonials', 'description', e.target.value)} className={`${inputClass} resize-y`} /></div>
                        <div>
                            <label className={labelClass}>Depoimentos</label>
                            <div className="space-y-2">
                                {(data?.testimonials?.items || []).map((it: any, i: number) => (
                                    <div key={i} className="border border-adm-border rounded-lg p-3 space-y-2">
                                        <div className="flex justify-between items-center"><strong className="text-xs text-adm-ink-muted">Depoimento {i + 1}</strong><button type="button" onClick={() => rmItem('testimonials', i)} className="text-red-500"><X className="w-4 h-4" /></button></div>
                                        <input type="text" placeholder="Nome" value={it.name || ''} onChange={e => setArr('testimonials', i, 'name', e.target.value)} className={subInputClass} />
                                        <input type="text" placeholder="Cargo / Cidade" value={it.role || ''} onChange={e => setArr('testimonials', i, 'role', e.target.value)} className={subInputClass} />
                                        <textarea rows={3} placeholder="Texto" value={it.text || ''} onChange={e => setArr('testimonials', i, 'text', e.target.value)} className={`${subInputClass} resize-y`} />
                                    </div>
                                ))}
                                <button type="button" onClick={() => addItem('testimonials', { name: '', role: '', text: '', image: '' })} className="text-sm font-bold text-adm-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
