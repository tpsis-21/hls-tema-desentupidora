import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, ChevronRight, Briefcase, Type, FileText, Image as ImageIcon, HelpCircle, LayoutGrid, Search, X } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';
import ImageUpload from './ImageUpload';
import IconPicker from './IconPicker';

type FAQItem = {
    question: string;
    answer: string;
};

type ServiceSidebar = {
    title: string;
    description: string;
    buttonText: string;
    link: string;
};

type ServiceItem = {
    title: string;
    description: string;
    icon: string;
    image: string;
    slug: string;
    link: string;
    fullContent?: string;
    image2?: string;
    image3?: string;
    faqs?: FAQItem[];
    sidebar?: ServiceSidebar;
};

export default function ServicesEditor() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const data = await githubApi('read', 'src/data/services.json');
                if (data) {
                    const parsed = JSON.parse(data.content);
                    // Suporte ao novo formato de objeto ou array antigo (migração)
                    if (parsed.items) {
                        setServices(parsed.items);
                    } else {
                        setServices(parsed);
                    }
                    setFileSha(data.sha);
                    if ((parsed.items || parsed).length > 0) setSelectedIndex(0);
                }
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const updateService = (updated: ServiceItem) => {
        if (selectedIndex === null) return;
        const newServices = [...services];
        newServices[selectedIndex] = updated;
        setServices(newServices);
    };

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    const addService = () => {
        const newItem: ServiceItem = {
            title: 'Novo Serviço',
            description: 'Descrição curta do serviço...',
            icon: 'Briefcase',
            image: '/assets/images/service/1.jpg',
            slug: 'novo-servico',
            link: '/servicos/novo-servico',
            fullContent: '',
            faqs: [],
            sidebar: {
                title: 'Como Podemos <br> Ajudar Você?',
                description: 'Atendimento emergencial 24 horas por dia em toda a região.',
                buttonText: 'Fale Conosco',
                link: '/contato'
            }
        };
        setServices([...services, newItem]);
        setSelectedIndex(services.length);
    };

    const deleteService = (idx: number) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            const newServices = services.filter((_, i) => i !== idx);
            setServices(newServices);
            setSelectedIndex(newServices.length > 0 ? 0 : null);
        }
    };

    async function save() {
        setSaving(true);
        try {
            const payload = {
                items: services
            };
            await githubApi('write', 'src/data/services.json', {
                content: JSON.stringify(payload, null, 4),
                sha: fileSha,
            });
            const fresh = await githubApi('read', 'src/data/services.json');
            setFileSha(fresh.sha);
            triggerToast('Base de Serviços atualizada!', 'success');
        } catch (err: any) {
            triggerToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-adm-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm tracking-widest uppercase font-bold">Carregando Serviços...</span>
        </div>
    );

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const current = selectedIndex !== null ? services[selectedIndex] : null;

    return (
        <div className="max-w-6xl space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-adm-bg/90 backdrop-blur-md z-30 py-4 -mt-4 border-b border-adm-border shadow-sm px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-adm-ink text-lg">Editor de Serviços</h2>
                        <p className="text-xs text-adm-ink-muted font-medium">Gerencie a listagem e páginas internas</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={addService}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                    >
                        <Plus className="w-4 h-4" /> Novo Serviço
                    </button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md active:scale-95"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Gravando...' : 'Publicar Alterações'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar List */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-adm-ink-faint" />
                        <input
                            type="text"
                            placeholder="Filtrar serviços..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-adm-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="bg-white rounded-2xl border border-adm-border shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
                        <div className="p-3 bg-adm-bg border-b border-adm-border flex justify-between items-center">
                            <span className="text-[10px] font-black text-adm-ink-faint uppercase tracking-widest">Lista de Serviços ({services.length})</span>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar">
                            {filteredServices.map((s, i) => {
                                const realIndex = services.indexOf(s);
                                return (
                                    <div
                                        key={realIndex}
                                        onClick={() => setSelectedIndex(realIndex)}
                                        className={`w-full text-left p-4 flex items-center gap-3 border-b border-slate-50 transition-all group cursor-pointer ${selectedIndex === realIndex ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-adm-elev'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedIndex === realIndex ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                            <IconPicker value={s.icon} disabled />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${selectedIndex === realIndex ? 'text-blue-700' : 'text-slate-700'}`}>{s.title}</p>
                                            <p className="text-[10px] text-adm-ink-faint font-mono truncate">/{s.slug}</p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedIndex === realIndex ? 'text-blue-400 translate-x-1' : 'text-slate-200 group-hover:translate-x-1'}`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Form */}
                <div className="lg:col-span-8">
                    {current ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Basic Info */}
                            <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b pb-4 mb-2">
                                    <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 uppercase tracking-wider">
                                        <LayoutGrid className="w-4 h-4 text-blue-500" /> Informações Básicas (Card)
                                    </h4>
                                    <button
                                        onClick={() => deleteService(selectedIndex!)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                                        title="Excluir Serviço"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Nome do Serviço</label>
                                        <input
                                            type="text"
                                            value={current.title}
                                            onChange={e => {
                                                const title = e.target.value;
                                                updateService({ ...current, title, slug: generateSlug(title), link: `/servicos/${generateSlug(title)}` });
                                            }}
                                            className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">URL (Slug)</label>
                                        <div className="flex items-center bg-slate-100 rounded-xl px-4 border border-adm-border">
                                            <span className="text-xs text-adm-ink-faint font-mono">/servicos/</span>
                                            <input
                                                type="text"
                                                value={current.slug}
                                                onChange={e => updateService({ ...current, slug: e.target.value, link: `/servicos/${e.target.value}` })}
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-mono py-2.5"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Descrição Curta (para listagem)</label>
                                        <textarea
                                            value={current.description}
                                            onChange={e => updateService({ ...current, description: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Ícone</label>
                                            <IconPicker
                                                value={current.icon}
                                                onChange={val => updateService({ ...current, icon: val })}
                                            />
                                        </div>
                                        <ImageUpload
                                            label="Imagem de Capa"
                                            value={current.image}
                                            onChange={val => updateService({ ...current, image: val })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Content */}
                            <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                                <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-4 mb-2 uppercase tracking-wider">
                                    <FileText className="w-4 h-4 text-emerald-500" /> Conteúdo Detalhado (Página Interna)
                                </h4>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Texto Completo do Serviço</label>
                                    <textarea
                                        value={current.fullContent || ''}
                                        onChange={e => updateService({ ...current, fullContent: e.target.value })}
                                        rows={8}
                                        placeholder="Conteúdo detalhado que aparecerá na página individual deste serviço..."
                                        className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-sm leading-relaxed"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ImageUpload
                                        label="Imagem Interna 02"
                                        value={current.image2 || ''}
                                        onChange={val => updateService({ ...current, image2: val })}
                                    />
                                    <ImageUpload
                                        label="Imagem Interna 03"
                                        value={current.image3 || ''}
                                        onChange={val => updateService({ ...current, image3: val })}
                                    />
                                </div>
                            </div>

                            {/* Sidebar Config Section */}
                            <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                                <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-4 mb-2 uppercase tracking-wider">
                                    <HelpCircle className="w-4 h-4 text-orange-500" /> Sidebar de Atendimento (Card)
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Título do Card (Aceita HTML)</label>
                                        <input
                                            type="text"
                                            value={current.sidebar?.title || ''}
                                            placeholder="Ex: Como podemos <br> ajudar você?"
                                            onChange={e => updateService({
                                                ...current,
                                                sidebar: { ...(current.sidebar || { title: '', description: '', buttonText: '', link: '' }), title: e.target.value }
                                            })}
                                            className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Descrição</label>
                                        <textarea
                                            value={current.sidebar?.description || ''}
                                            onChange={e => updateService({
                                                ...current,
                                                sidebar: { ...(current.sidebar || { title: '', description: '', buttonText: '', link: '' }), description: e.target.value }
                                            })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Texto do Botão</label>
                                            <input
                                                type="text"
                                                value={current.sidebar?.buttonText || ''}
                                                onChange={e => updateService({
                                                    ...current,
                                                    sidebar: { ...(current.sidebar || { title: '', description: '', buttonText: '', link: '' }), buttonText: e.target.value }
                                                })}
                                                className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-adm-ink-faint uppercase ml-1 tracking-widest">Link (URL ou WhatsApp)</label>
                                            <input
                                                type="text"
                                                value={current.sidebar?.link || ''}
                                                placeholder="/contato ou https://wa.me/..."
                                                onChange={e => updateService({
                                                    ...current,
                                                    sidebar: { ...(current.sidebar || { title: '', description: '', buttonText: '', link: '' }), link: e.target.value }
                                                })}
                                                className="w-full px-4 py-2.5 bg-adm-bg border border-adm-border rounded-xl text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b pb-4 mb-2">
                                    <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 uppercase tracking-wider">
                                        <HelpCircle className="w-4 h-4 text-orange-500" /> Perguntas Frequentes (FAQ)
                                    </h4>
                                    <button
                                        onClick={() => updateService({ ...current, faqs: [...(current.faqs || []), { question: '', answer: '' }] })}
                                        className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-all uppercase tracking-widest"
                                    >
                                        + Adicionar FAQ
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {current.faqs?.map((faq, fIdx) => (
                                        <div key={fIdx} className="bg-adm-bg p-4 rounded-xl border border-adm-border space-y-3 relative group">
                                            <button
                                                onClick={() => updateService({ ...current, faqs: current.faqs?.filter((_, i) => i !== fIdx) })}
                                                className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Pergunta?"
                                                value={faq.question}
                                                onChange={e => {
                                                    const nFaqs = [...(current.faqs || [])];
                                                    nFaqs[fIdx].question = e.target.value;
                                                    updateService({ ...current, faqs: nFaqs });
                                                }}
                                                className="w-full bg-white border border-adm-border rounded-lg px-3 py-2 text-sm font-bold"
                                            />
                                            <textarea
                                                placeholder="Resposta técnica..."
                                                value={faq.answer}
                                                onChange={e => {
                                                    const nFaqs = [...(current.faqs || [])];
                                                    nFaqs[fIdx].answer = e.target.value;
                                                    updateService({ ...current, faqs: nFaqs });
                                                }}
                                                rows={2}
                                                className="w-full bg-white border border-adm-border rounded-lg px-3 py-2 text-xs leading-relaxed"
                                            />
                                        </div>
                                    ))}
                                    {(!current.faqs || current.faqs.length === 0) && (
                                        <div className="text-center py-6 border-2 border-dashed border-adm-border rounded-2xl">
                                            <p className="text-xs text-adm-ink-faint font-medium">Nenhum FAQ personalizado para este serviço.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-adm-border text-adm-ink-faint">
                            <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">Selecione um serviço para editar</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
