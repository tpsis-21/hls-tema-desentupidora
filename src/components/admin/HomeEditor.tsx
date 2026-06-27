import React, { useState, useEffect } from 'react';
import { Home, Image, List, Activity, Users, Calendar, MessageSquare, Newspaper, Save, Loader2, AlertCircle, Plus, Trash2, ChevronRight, Video, TrendingUp, ToggleLeft } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';
import ImageUpload from './ImageUpload';
import IconPicker from './IconPicker';

type HeroSlide = {
    title: string;
    subtitle: string;
    bgImage: string;
    btnText: string;
    btnLink: string;
};

type FeatureItem = {
    title: string;
    icon: string;
    active?: boolean;
};

type ServiceItem = {
    title: string;
    description: string;
    icon: string;
    link: string;
};

type TeamMember = {
    name: string;
    role: string;
    image: string;
};

type Testimonial = {
    name: string;
    role: string;
    text: string;
    image: string;
};

type FunFactItem = {
    count: string;
    label: string;
    icon: string;
    suffix?: string;
};

type HomeConfig = {
    hero: { slides: HeroSlide[] };
    features: { items: FeatureItem[] };
    services: { title: string; description: string; items: ServiceItem[] };
    funFacts: { items: FunFactItem[]; backgroundImage: string };
    team: { title: string; subtitle: string; showSection: boolean; items: TeamMember[] };
    booking: { subtitle: string; title: string; videoUrl: string; image: string; imageS2: string };
    testimonials: { title: string; subtitle: string; description: string; items: Testimonial[] };
    latestBlog: { title: string; subtitle: string; description: string };
};

const DEFAULT_CONFIG: HomeConfig = {
    hero: { slides: [] },
    features: { items: [] },
    services: { title: '', description: '', items: [] },
    funFacts: { items: [], backgroundImage: '' },
    team: { title: '', subtitle: '', showSection: true, items: [] },
    booking: { subtitle: '', title: '', videoUrl: '', image: '', imageS2: '' },
    testimonials: { title: '', subtitle: '', description: '', items: [] },
    latestBlog: { title: '', subtitle: '', description: '' }
};

type Tab = 'hero' | 'features' | 'services_facts' | 'other' | 'sections';

export default function HomeEditor() {
    const [config, setConfig] = useState<HomeConfig>(DEFAULT_CONFIG);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<Tab>('hero');

    useEffect(() => {
        async function load() {
            try {
                const data = await githubApi('read', 'src/data/home.json');
                if (data) {
                    setConfig(JSON.parse(data.content));
                    setFileSha(data.sha);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function save() {
        setSaving(true);
        try {
            await githubApi('write', 'src/data/home.json', {
                content: JSON.stringify(config, null, 4),
                sha: fileSha,
            });
            const fresh = await githubApi('read', 'src/data/home.json');
            setFileSha(fresh.sha);
            triggerToast('Homepage atualizada!', 'success');
        } catch (err: any) {
            triggerToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    }

    const updateNested = (path: string, value: any) => {
        setConfig(prev => {
            const next = { ...prev };
            const keys = path.split('.');
            let curr: any = next;
            for (let i = 0; i < keys.length - 1; i++) {
                curr = curr[keys[i]];
            }
            curr[keys[keys.length - 1]] = value;
            return { ...next };
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-adm-ink-muted">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm">Carregando configuração...</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
        </div>
    );

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-adm-bg/80 backdrop-blur-md z-10 py-4 -mt-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-adm-ink text-lg">Editor da Homepage</h2>
                        <p className="text-sm text-adm-ink-muted">Gerencie todas as seções dinâmicas</p>
                    </div>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md active:scale-95"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Gravando...' : 'Salvar Alterações'}
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit">
                {(['hero', 'features', 'services_facts', 'other', 'sections'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-adm-ink-muted hover:text-adm-ink hover:bg-white/50'
                            }`}
                    >
                        {t === 'hero' && <Image className="w-4 h-4" />}
                        {t === 'features' && <List className="w-4 h-4" />}
                        {t === 'services_facts' && <Activity className="w-4 h-4" />}
                        {t === 'other' && <Users className="w-4 h-4" />}
                        {t === 'sections' && <ToggleLeft className="w-4 h-4" />}
                        {t === 'hero' ? 'Banner Hero' : t === 'features' ? 'Caracteristicas' : t === 'services_facts' ? 'Servicos & Numeros' : t === 'sections' ? 'Secoes' : 'Agendamento & Outros'}
                    </button>
                ))}
            </div>

            {/* Tab: Hero */}
            {tab === 'hero' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-adm-ink flex items-center gap-2">
                            <Image className="w-5 h-5 text-blue-500" /> Slides do Banner
                        </h3>
                        <button
                            onClick={() => updateNested('hero.slides', [...config.hero.slides, { title: '', subtitle: '', bgImage: '', btnText: '', btnLink: '' }])}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> Adicionar Slide
                        </button>
                    </div>

                    <div className="grid gap-6">
                        {config.hero.slides.map((slide, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-adm-border shadow-sm overflow-hidden group">
                                <div className="bg-adm-bg px-6 py-3 border-b border-adm-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-adm-ink-faint uppercase tracking-widest">Slide #{i + 1}</span>
                                    <button
                                        onClick={() => updateNested('hero.slides', config.hero.slides.filter((_, idx) => idx !== i))}
                                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título Principal</label>
                                            <input
                                                type="text"
                                                value={slide.title}
                                                onChange={e => {
                                                    const s = [...config.hero.slides];
                                                    s[i].title = e.target.value;
                                                    updateNested('hero.slides', s);
                                                }}
                                                className="w-full px-4 py-2.5 border border-adm-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Subtítulo / Descrição</label>
                                            <textarea
                                                value={slide.subtitle}
                                                onChange={e => {
                                                    const s = [...config.hero.slides];
                                                    s[i].subtitle = e.target.value;
                                                    updateNested('hero.slides', s);
                                                }}
                                                rows={2}
                                                className="w-full px-4 py-2.5 border border-adm-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <ImageUpload
                                            label="Imagem de Fundo"
                                            value={slide.bgImage}
                                            onChange={val => {
                                                const s = [...config.hero.slides];
                                                s[i].bgImage = val;
                                                updateNested('hero.slides', s);
                                            }}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Texto do Botão</label>
                                                <input
                                                    type="text"
                                                    value={slide.btnText}
                                                    onChange={e => {
                                                        const s = [...config.hero.slides];
                                                        s[i].btnText = e.target.value;
                                                        updateNested('hero.slides', s);
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-adm-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Link do Botão</label>
                                                <input
                                                    type="text"
                                                    value={slide.btnLink}
                                                    onChange={e => {
                                                        const s = [...config.hero.slides];
                                                        s[i].btnLink = e.target.value;
                                                        updateNested('hero.slides', s);
                                                    }}
                                                    className="w-full px-4 py-2.5 border border-adm-border rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab: Features */}
            {tab === 'features' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h3 className="font-bold text-adm-ink flex items-center gap-2">
                        <List className="w-5 h-5 text-blue-500" /> Diferenciais da Seção Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {config.features.items.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título do Item</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => {
                                            const items = [...config.features.items];
                                            items[i].title = e.target.value;
                                            updateNested('features.items', items);
                                        }}
                                        className="w-full px-3 py-2 border border-adm-border rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Ícone Visual</label>
                                    <IconPicker
                                        value={item.icon}
                                        onChange={val => {
                                            const items = [...config.features.items];
                                            items[i].icon = val;
                                            updateNested('features.items', items);
                                        }}
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.active}
                                        onChange={e => {
                                            const items = [...config.features.items];
                                            items[i].active = e.target.checked;
                                            updateNested('features.items', items);
                                        }}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Destaque (Ativo)</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab: Services & Facts */}
            {tab === 'services_facts' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Services Text */}
                    <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-4">
                        <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-3 mb-4">
                            <Activity className="w-4 h-4 text-blue-500" /> Títulos da Seção de Serviços
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título da Seção</label>
                                <input
                                    type="text"
                                    value={config.services.title}
                                    onChange={e => updateNested('services.title', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-adm-border rounded-xl text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Descrição Curta</label>
                                <textarea
                                    value={config.services.description}
                                    onChange={e => updateNested('services.description', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-adm-border rounded-xl text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Items Grid */}
                    <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-4">
                        <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-3 mb-4">
                            <List className="w-4 h-4 text-blue-500" /> Itens de Serviço na Home (Máx 6)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {config.services.items?.map((item, i) => (
                                <div key={i} className="bg-adm-bg p-4 rounded-xl border border-adm-border space-y-3 group relative">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-adm-ink-faint uppercase tracking-widest">Serviço #{i + 1}</span>
                                        <button
                                            onClick={() => {
                                                const items = config.services.items.filter((_, idx) => idx !== i);
                                                updateNested('services.items', items);
                                            }}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <IconPicker
                                        value={item.icon}
                                        onChange={val => {
                                            const items = [...config.services.items];
                                            items[i].icon = val;
                                            updateNested('services.items', items);
                                        }}
                                    />

                                    <input
                                        type="text"
                                        placeholder="Título do Serviço"
                                        value={item.title}
                                        onChange={e => {
                                            const items = [...config.services.items];
                                            items[i].title = e.target.value;
                                            updateNested('services.items', items);
                                        }}
                                        className="w-full px-3 py-1.5 border border-adm-border rounded-xl text-sm font-bold"
                                    />

                                    <textarea
                                        placeholder="Descrição curta"
                                        value={item.description}
                                        onChange={e => {
                                            const items = [...config.services.items];
                                            items[i].description = e.target.value;
                                            updateNested('services.items', items);
                                        }}
                                        rows={2}
                                        className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-xs resize-none"
                                    />

                                    <input
                                        type="text"
                                        placeholder="Link (ex: /servicos/...)"
                                        value={item.link}
                                        onChange={e => {
                                            const items = [...config.services.items];
                                            items[i].link = e.target.value;
                                            updateNested('services.items', items);
                                        }}
                                        className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-[10px] font-mono"
                                    />
                                </div>
                            ))}

                            {config.services.items?.length < 6 && (
                                <button
                                    onClick={() => updateNested('services.items', [...config.services.items, { title: '', description: '', icon: 'Briefcase', link: '/servicos' }])}
                                    className="border-2 border-dashed border-adm-border rounded-xl flex flex-col items-center justify-center p-6 text-adm-ink-faint hover:border-blue-300 hover:text-blue-500 transition-all gap-2"
                                >
                                    <Plus className="w-6 h-6" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Novo Serviço</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Fun Facts */}
                    <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-4">
                        <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-3 mb-4">
                            <TrendingUp className="w-4 h-4 text-emerald-500" /> Números e Estatísticas (FunFacts)
                        </h4>
                        <div className="mb-6">
                            <ImageUpload
                                label="Imagem de Fundo da Seção"
                                value={config.funFacts.backgroundImage}
                                onChange={val => updateNested('funFacts.backgroundImage', val)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {config.funFacts.items.map((fact, i) => (
                                <div key={i} className="bg-adm-bg p-4 rounded-xl border border-adm-border space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-adm-ink-faint uppercase mb-1">Número</label>
                                        <input
                                            type="text"
                                            value={fact.count}
                                            onChange={e => {
                                                const items = [...config.funFacts.items];
                                                items[i].count = e.target.value;
                                                updateNested('funFacts.items', items);
                                            }}
                                            className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-sm font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-adm-ink-faint uppercase mb-1">Etiqueta</label>
                                        <input
                                            type="text"
                                            value={fact.label}
                                            onChange={e => {
                                                const items = [...config.funFacts.items];
                                                items[i].label = e.target.value;
                                                updateNested('funFacts.items', items);
                                            }}
                                            className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-adm-ink-faint uppercase mb-1">Sufixo (ex: +, %)</label>
                                        <input
                                            type="text"
                                            value={fact.suffix || ''}
                                            onChange={e => {
                                                const items = [...config.funFacts.items];
                                                items[i].suffix = e.target.value;
                                                updateNested('funFacts.items', items);
                                            }}
                                            className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Other */}
            {tab === 'other' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Booking Section */}
                    <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                        <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-3">
                            <Calendar className="w-4 h-4 text-orange-500" /> Agendamento & Vídeo
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Subtítulo (Destaque)</label>
                                    <input
                                        type="text"
                                        value={config.booking.subtitle}
                                        onChange={e => updateNested('booking.subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título Chamativo</label>
                                    <input
                                        type="text"
                                        value={config.booking.title}
                                        onChange={e => updateNested('booking.title', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5 flex items-center gap-1">
                                        <Video className="w-3.5 h-3.5" /> URL do Vídeo (YouTube/Embed)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.booking.videoUrl}
                                        onChange={e => updateNested('booking.videoUrl', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <ImageUpload
                                    label="Imagem de Fundo Lateral"
                                    value={config.booking.image}
                                    onChange={val => updateNested('booking.image', val)}
                                />
                                <ImageUpload
                                    label="Imagem Adicional (PNG)"
                                    value={config.booking.imageS2}
                                    onChange={val => updateNested('booking.imageS2', val)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Testimonials & Blog Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team Section */}
                        <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" /> Especialistas (Equipe)
                                </h4>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.team.showSection}
                                        onChange={e => updateNested('team.showSection', e.target.checked)}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Mostrar Seção</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título Curto</label>
                                    <input
                                        type="text"
                                        value={config.team.title}
                                        onChange={e => updateNested('team.title', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título Principal</label>
                                    <input
                                        type="text"
                                        value={config.team.subtitle}
                                        onChange={e => updateNested('team.subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-adm-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-adm-ink-faint uppercase tracking-widest">Membros da Equipe</span>
                                    <button
                                        onClick={() => updateNested('team.items', [...(config.team.items || []), { name: '', role: '', image: '' }])}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Adicionar Membro
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {config.team.items?.map((member, i) => (
                                        <div key={i} className="bg-adm-bg p-4 rounded-xl border border-adm-border relative group">
                                            <button
                                                onClick={() => updateNested('team.items', config.team.items.filter((_, idx) => idx !== i))}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="space-y-3">
                                                <ImageUpload
                                                    label="Foto"
                                                    value={member.image}
                                                    onChange={val => {
                                                        const items = [...config.team.items];
                                                        items[i].image = val;
                                                        updateNested('team.items', items);
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nome Completo"
                                                    value={member.name}
                                                    onChange={e => {
                                                        const items = [...config.team.items];
                                                        items[i].name = e.target.value;
                                                        updateNested('team.items', items);
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-sm font-bold"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Cargo / Especialidade"
                                                    value={member.role}
                                                    onChange={e => {
                                                        const items = [...config.team.items];
                                                        items[i].role = e.target.value;
                                                        updateNested('team.items', items);
                                                    }}
                                                    className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-xs"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Testimonials Section */}
                        <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-6">
                            <h4 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-3">
                                <MessageSquare className="w-4 h-4 text-emerald-500" /> Depoimentos de Clientes
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título Curto</label>
                                    <input
                                        type="text"
                                        value={config.testimonials.title}
                                        onChange={e => updateNested('testimonials.title', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Título Principal</label>
                                    <input
                                        type="text"
                                        value={config.testimonials.subtitle}
                                        onChange={e => updateNested('testimonials.subtitle', e.target.value)}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl"
                                    />
                                </div>
                                <div className="col-span-full">
                                    <label className="block text-xs font-bold text-adm-ink-muted uppercase mb-1.5">Descrição da Seção</label>
                                    <textarea
                                        value={config.testimonials.description}
                                        onChange={e => updateNested('testimonials.description', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2 border border-adm-border rounded-xl resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-adm-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-adm-ink-faint uppercase tracking-widest">Depoimentos</span>
                                    <button
                                        onClick={() => updateNested('testimonials.items', [...(config.testimonials.items || []), { name: '', role: '', text: '', image: '' }])}
                                        className="text-xs font-bold text_emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {config.testimonials.items?.map((testi, i) => (
                                        <div key={i} className="bg-adm-bg p-4 rounded-xl border border-adm-border relative group">
                                            <button
                                                onClick={() => updateNested('testimonials.items', config.testimonials.items.filter((_, idx) => idx !== i))}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="space-y-3">
                                                <ImageUpload
                                                    label="Foto do Cliente"
                                                    value={testi.image}
                                                    onChange={val => {
                                                        const items = [...config.testimonials.items];
                                                        items[i].image = val;
                                                        updateNested('testimonials.items', items);
                                                    }}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Nome"
                                                        value={testi.name}
                                                        onChange={e => {
                                                            const items = [...config.testimonials.items];
                                                            items[i].name = e.target.value;
                                                            updateNested('testimonials.items', items);
                                                        }}
                                                        className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-sm font-bold"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Cargo/Local"
                                                        value={testi.role}
                                                        onChange={e => {
                                                            const items = [...config.testimonials.items];
                                                            items[i].role = e.target.value;
                                                            updateNested('testimonials.items', items);
                                                        }}
                                                        className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-xs"
                                                    />
                                                </div>
                                                <textarea
                                                    placeholder="O que o cliente disse..."
                                                    value={testi.text}
                                                    onChange={e => {
                                                        const items = [...config.testimonials.items];
                                                        items[i].text = e.target.value;
                                                        updateNested('testimonials.items', items);
                                                    }}
                                                    rows={3}
                                                    className="w-full px-3 py-1.5 border border-adm-border rounded-lg text-xs resize-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Blog */}
                        <div className="bg-white p-5 rounded-2xl border border-adm-border shadow-sm space-y-4 col-span-full">
                            <h4 className="font-bold text-adm-ink text-xs flex items-center gap-2 uppercase tracking-wider text-adm-ink-faint">
                                <Newspaper className="w-3.5 h-3.5" /> Cabeçalho Blog
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={config.latestBlog.title}
                                        onChange={e => updateNested('latestBlog.title', e.target.value)}
                                        placeholder="Subtítulo"
                                        className="w-full px-3 py-2 border border-adm-border rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={config.latestBlog.subtitle}
                                        onChange={e => updateNested('latestBlog.subtitle', e.target.value)}
                                        placeholder="Título"
                                        className="w-full px-3 py-2 border border-adm-border rounded-lg text-sm font-bold"
                                    />
                                </div>
                                <textarea
                                    value={config.latestBlog.description}
                                    onChange={e => updateNested('latestBlog.description', e.target.value)}
                                    placeholder="Descrição"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-adm-border rounded-lg text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Secoes */}
            {tab === 'sections' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white p-6 rounded-2xl border border-adm-border shadow-sm space-y-4">
                        <h3 className="font-bold text-adm-ink text-sm flex items-center gap-2 border-b pb-3 mb-4">
                            <ToggleLeft className="w-4 h-4 text-violet-500" /> Secoes da Home
                        </h3>
                        <p className="text-xs text-adm-ink-muted mb-4">Escolha quais secoes ficam visiveis na homepage.</p>
                        <div className="space-y-3">
                            {[
                                { key: 'showFeatures', label: 'Caracteristicas / Diferenciais' },
                                { key: 'showServices', label: 'Servicos' },
                                { key: 'showFunFacts', label: 'Numeros / Estatisticas' },
                                { key: 'showTeam', label: 'Especialistas (Equipe)' },
                                { key: 'showBooking', label: 'Agendamento & Video' },
                                { key: 'showTestimonials', label: 'Depoimentos' },
                                { key: 'showBlog', label: 'Blog / Artigos Recentes' },
                            ].map(s => (
                                <label key={s.key} className="flex items-center gap-3 p-3 bg-adm-bg rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={(config as any).sections?.[s.key] !== false}
                                        onChange={e => setConfig(prev => ({ ...prev, sections: { ...(prev as any).sections, [s.key]: e.target.checked } } as any))}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{s.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
