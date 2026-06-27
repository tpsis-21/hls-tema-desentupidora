import React from 'react';
import {
    LayoutDashboard, FileText, Tag, Users, Home, Info, Phone,
    Shield, Settings, LogOut, ChevronRight, ExternalLink, Navigation,
    Sparkles, FileArchive,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    section: string;
}

const mainItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, section: 'dashboard' },
    { label: 'Artigos', href: '/admin/posts', icon: FileText, section: 'posts' },
    { label: 'Categorias', href: '/admin/categories', icon: Tag, section: 'categories' },
    { label: 'Autores', href: '/admin/authors', icon: Users, section: 'authors' },
];

const pageItems: NavItem[] = [
    { label: 'Menu', href: '/admin/menu', icon: Navigation, section: 'menu' },
    { label: 'Home', href: '/admin/home', icon: Home, section: 'home' },
    { label: 'Sobre', href: '/admin/sobre', icon: Info, section: 'sobre' },
    { label: 'Contato', href: '/admin/contato', icon: Phone, section: 'contato' },
    { label: 'Privacidade & Termos', href: '/admin/legal', icon: Shield, section: 'legal' },
];

const pluginItems: NavItem[] = [
    { label: 'Plugins', href: '/admin/plugins', icon: Sparkles, section: 'plugins' },
    { label: 'Google Tag', href: '/admin/google-tag', icon: Tag, section: 'google-tag' },
];

interface AdminNavProps {
    activeSection?: string;
    extraItems?: NavItem[];
}

export default function AdminNav({ activeSection = '', extraItems = [] }: AdminNavProps) {
    const allMainItems = [...mainItems, ...extraItems];

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-adm-sidebar border-r border-adm-sidebar-border flex flex-col z-50 text-adm-sidebar-fg">
            <div className="h-16 flex items-center px-5 border-b border-adm-sidebar-border shrink-0">
                <a href="/admin" className="flex items-center gap-2.5 no-underline min-w-0">
                    <div className="w-8 h-8 bg-adm-primary rounded-lg flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-adm-sidebar-fg text-sm tracking-tight truncate">Meu Painel</span>
                </a>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <div className="mb-5">
                    <p className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Principal</p>
                    {allMainItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                <div className="mb-5">
                    <p className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Paginas</p>
                    {pageItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                <div className="mb-5">
                    <p className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Plugins</p>
                    {pluginItems.map(item => (
                        <NavLink key={item.href} item={item} active={activeSection === item.section} />
                    ))}
                </div>

                <div>
                    <p className="text-[10px] font-bold text-adm-sidebar-muted uppercase tracking-[0.14em] px-3 mb-1.5">Sistema</p>
                    <NavLink item={{ label: 'Configuracoes', href: '/admin/config', icon: Settings, section: 'config' }} active={activeSection === 'config'} />
                    <NavLink item={{ label: 'Backup', href: '/admin/backup', icon: FileArchive, section: 'backup' }} active={activeSection === 'backup'} />
                </div>
            </nav>

            <div className="p-3 border-t border-adm-sidebar-border space-y-0.5 shrink-0">
                <a href="/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-adm-sidebar-muted hover:text-adm-sidebar-fg hover:bg-adm-sidebar-accent transition-colors">
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">Ver site</span>
                </a>
                <a href="/api/admin/logout" className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg text-adm-sidebar-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4 shrink-0" />
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
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {active && <ChevronRight className="w-3 h-3 text-adm-primary/60 shrink-0" />}
        </a>
    );
}
