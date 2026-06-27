import React from 'react';
import {
    FileText, Tag, Users, Info, Phone,
    Shield, Settings, LogOut, ExternalLink, Navigation,
    Package, FileArchive, PenLine, ChevronRight, Home, Sparkles, Palette,
    Building2, LayoutDashboard, Layers, Stethoscope, MapPin, ListTree,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    section: string;
}

const contentSections = ['posts', 'categories', 'authors'];

const pageItems: NavItem[] = [
    { label: 'Tema do site', href: '/admin/tema', icon: Palette, section: 'tema' },
    { label: 'Navegação do site', href: '/admin/menu', icon: Navigation, section: 'menu' },
    { label: 'Sobre', href: '/admin/sobre', icon: Info, section: 'sobre' },
    { label: 'Contato', href: '/admin/contato', icon: Phone, section: 'contato' },
    { label: 'Privacidade & Termos', href: '/admin/legal', icon: Shield, section: 'legal' },
];

interface AdminNavProps {
    activeSection?: string;
    extraItems?: NavItem[];
}

export default function AdminNav({ activeSection = '', extraItems = [] }: AdminNavProps) {
    return (
        <aside
            className="fixed inset-y-0 left-0 w-64 bg-adm-sidebar border-r border-adm-sidebar-border flex flex-col z-50 text-adm-sidebar-fg"
            aria-label="Navegação do painel"
        >
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-adm-primary focus:text-white focus:rounded focus:text-sm focus:font-semibold"
            >
                Pular para o conteúdo principal
            </a>

            <div className="h-16 flex items-center px-5 border-b border-adm-sidebar-border shrink-0">
                <a
                    href="/admin"
                    aria-label="Ir para o início do painel"
                    className="flex items-center gap-2.5 no-underline min-w-0"
                >
                    <div className="w-8 h-8 bg-adm-primary rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                        <Home className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-adm-sidebar-fg text-sm tracking-tight truncate">Meu Painel</span>
                </a>
            </div>

            <div className="px-3 pt-4 pb-3 border-b border-adm-sidebar-border shrink-0">
                <a
                    href="/admin/posts/new"
                    className="flex items-center justify-center gap-2 w-full bg-adm-primary hover:brightness-95 text-white rounded-lg px-4 py-2.5 min-h-[44px] text-sm font-semibold transition-all shadow-sm"
                    aria-label="Escrever novo artigo"
                >
                    <PenLine className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Novo artigo
                </a>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Principal">
                <div className="mb-5">
                    <NavLink
                        item={{ label: 'Início', href: '/admin', icon: Home, section: 'dashboard' }}
                        active={activeSection === 'dashboard'}
                    />
                </div>

                <div className="mb-5" role="group" aria-labelledby="nav-conteudo">
                    <p id="nav-conteudo" className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Conteúdo</p>
                    <NavLink
                        item={{ label: 'Artigos', href: '/admin/posts', icon: FileText, section: 'posts' }}
                        active={activeSection === 'posts'}
                    />
                    <div className="pl-3 mt-0.5 space-y-0.5">
                        <SubNavLink label="Categorias" href="/admin/categories" icon={Tag} active={activeSection === 'categories'} />
                        <SubNavLink label="Autores" href="/admin/authors" icon={Users} active={activeSection === 'authors'} />
                        <SubNavLink label="Gerar com IA" href="/admin/ai" icon={Sparkles} active={activeSection === 'ai'} />
                        {extraItems.map(item => (
                            <SubNavLink key={item.href} label={item.label} href={item.href} icon={item.icon} active={activeSection === item.section} />
                        ))}
                    </div>
                </div>

                <div className="mb-5" role="group" aria-labelledby="nav-site">
                    <p id="nav-site" className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Conteúdo do site</p>
                    <NavLink item={{ label: 'Páginas do site', href: '/admin/paginas', icon: ListTree, section: 'paginas' }} active={activeSection === 'paginas'} />
                    <NavLink item={{ label: 'Dados da clínica', href: '/admin/dados-clinica', icon: Building2, section: 'dados-clinica' }} active={activeSection === 'dados-clinica'} />
                    <NavLink item={{ label: 'Home', href: '/admin/home', icon: LayoutDashboard, section: 'home' }} active={activeSection === 'home'} />
                    <NavLink item={{ label: 'Serviços', href: '/admin/pagina-servicos', icon: Layers, section: 'pagina-servicos' }} active={activeSection === 'pagina-servicos'} />
                    <NavLink item={{ label: 'Equipe', href: '/admin/pagina-equipe', icon: Users, section: 'pagina-equipe' }} active={activeSection === 'pagina-equipe'} />
                    <NavLink item={{ label: 'Sobre', href: '/admin/pagina-sobre', icon: Info, section: 'pagina-sobre' }} active={activeSection === 'pagina-sobre'} />
                    <NavLink item={{ label: 'Contato', href: '/admin/pagina-contato', icon: Phone, section: 'pagina-contato' }} active={activeSection === 'pagina-contato'} />
                    <NavLink item={{ label: 'Agendar', href: '/admin/pagina-agendar', icon: Home, section: 'pagina-agendar' }} active={activeSection === 'pagina-agendar'} />
                </div>

                <div className="mb-5" role="group" aria-labelledby="nav-seo-local">
                    <p id="nav-seo-local" className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">SEO Local</p>
                    <NavLink item={{ label: 'Serviços', href: '/admin/servicos', icon: Stethoscope, section: 'servicos' }} active={activeSection === 'servicos'} />
                    <NavLink item={{ label: 'Localidades', href: '/admin/localidades', icon: MapPin, section: 'localidades' }} active={activeSection === 'localidades'} />
                </div>

                <div className="mb-5" role="group" aria-labelledby="nav-paginas">
                    <p id="nav-paginas" className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Páginas</p>
                    {pageItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                <div role="group" aria-labelledby="nav-config">
                    <p id="nav-config" className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Configurações</p>
                    <NavLink item={{ label: 'Plugins', href: '/admin/plugins', icon: Package, section: 'plugins' }} active={activeSection === 'plugins'} />
                    <NavLink item={{ label: 'Configurações', href: '/admin/config', icon: Settings, section: 'config' }} active={activeSection === 'config'} />
                    <NavLink item={{ label: 'Backup', href: '/admin/backup', icon: FileArchive, section: 'backup' }} active={activeSection === 'backup'} />
                </div>
            </nav>

            <div className="p-3 border-t border-adm-sidebar-border space-y-0.5 shrink-0">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver site publicado (abre em nova aba)"
                    className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-adm-sidebar-muted hover:text-adm-sidebar-fg hover:bg-adm-sidebar-accent transition-colors"
                >
                    <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">Ver site</span>
                </a>
                <a
                    href="/api/admin/logout"
                    aria-label="Sair do painel"
                    className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-adm-sidebar-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">Sair</span>
                </a>
            </div>
        </aside>
    );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
    const Icon = item.icon;
    return (
        <a
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg mb-0.5 transition-colors text-sm font-medium ${
                active
                    ? 'bg-adm-sidebar-accent text-adm-primary border-l-2 border-adm-primary pl-[10px]'
                    : 'text-adm-sidebar-muted hover:text-adm-sidebar-fg hover:bg-adm-sidebar-accent'
            }`}
        >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">{item.label}</span>
            {active && <ChevronRight className="w-3 h-3 text-adm-primary/60 shrink-0" aria-hidden="true" />}
        </a>
    );
}

function SubNavLink({ label, href, icon: Icon, active }: { label: string; href: string; icon: React.ElementType; active: boolean }) {
    return (
        <a
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 min-h-[40px] rounded-lg transition-colors text-xs font-medium ${
                active
                    ? 'bg-adm-sidebar-accent text-adm-primary font-semibold'
                    : 'text-adm-sidebar-muted hover:text-adm-sidebar-fg hover:bg-adm-sidebar-accent'
            }`}
        >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {label}
        </a>
    );
}
