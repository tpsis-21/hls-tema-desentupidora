import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
    value: string;
    onChange?: (iconName: string) => void;
    disabled?: boolean;
}

// Lista de nomes de ícones comuns e úteis para sessões de "Características" e "Serviços"
const ICON_NAMES = [
    // Serviços e Hidráulica
    'Wrench', 'Droplets', 'Waves', 'ShowerHead', 'Bath', 'Trash2', 'Construction', 'Hammer', 'Filter', 'GlassWater',
    'Pipette', 'UtilityPole', 'Thermometer', 'ThermometerSnowflake', 'Flame', 'Sparkles', 'Zap', 'Lightbulb',
    // Casa e Construção
    'Home', 'Warehouse', 'HardHat', 'Paintbrush', 'Layers', 'Grid', 'Layout', 'Container', 'Box', 'Package',
    // Segurança e Check
    'ShieldCheck', 'Shield', 'CheckCircle2', 'Check', 'Verified', 'Award', 'Trophy', 'Medal',
    // Comunicação e Usuário
    'Phone', 'PhoneCall', 'MessageCircle', 'Mail', 'Users', 'UserCheck', 'UserPlus', 'Headphones',
    // Diversos
    'Star', 'Heart', 'Smile', 'Sun', 'Moon', 'Cloud', 'Wind', 'Umbrella', 'MapPin', 'Navigation',
    'Clock', 'Calendar', 'Bell', 'Info', 'Search', 'Settings', 'Camera', 'Video',
    'Smartphone', 'Monitor', 'Laptop', 'Server', 'Cpu', 'Database',
    'Briefcase', 'ShoppingBag', 'ShoppingCart', 'CreditCard', 'Wallet', 'Handshake', 'Rocket',
    'Activity', 'TrendingUp', 'BarChart', 'Target', 'Flag', 'Gift', 'Globe', 'Compass'
];

export default function IconPicker({ value, onChange, disabled }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredIcons = ICON_NAMES.filter(name =>
        name.toLowerCase().includes(search.toLowerCase())
    );

    const CurrentIcon = (LucideIcons as any)[value] || LucideIcons.HelpCircle;

    if (disabled) {
        return (
            <div className="flex items-center justify-center text-blue-600">
                <CurrentIcon size={18} />
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full px-4 py-2 bg-white border border-adm-border rounded-xl hover:bg-adm-elev transition-all text-sm group"
            >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <CurrentIcon size={18} />
                </div>
                <span className="font-medium text-slate-700">{value || 'Selecionar Ícone'}</span>
                <LucideIcons.ChevronDown size={14} className={`ml-auto text-adm-ink-faint transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] mt-2 w-[320px] bg-white rounded-2xl border border-adm-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-adm-border flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-sm">
                        <Search size={16} className="text-adm-ink-faint" />
                        <input
                            type="text"
                            placeholder="Buscar ícone..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-adm-ink-faint">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1 p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {filteredIcons.map(name => {
                            const Icon = (LucideIcons as any)[name];
                            if (!Icon) return null;
                            return (
                                <button
                                    key={name}
                                    title={name}
                                    type="button"
                                    onClick={() => {
                                        if (onChange) onChange(name);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${value === name
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-adm-ink-muted hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <Icon size={20} strokeWidth={value === name ? 2.5 : 2} />
                                </button>
                            );
                        })}
                        {filteredIcons.length === 0 && (
                            <div className="col-span-12 py-8 text-center text-xs text-adm-ink-faint">
                                Nenhum ícone encontrado
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
