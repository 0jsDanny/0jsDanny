import { createContext, useContext, useState, type ReactNode } from 'react';

export type AppRole = 'public' | 'admin_manager_medicamentos' | 'admin_protocol' | 'company';

export interface CompanyUnit {
    id: string;
    name: string;
    cnpj: string;
    address: string;
    status: 'Regular' | 'Pendente' | 'Inativa';
}

export interface UserProfile {
    name: string;
    sector: string;
    role: string;
    avatar?: string;
    companyId?: string;
    units?: CompanyUnit[];
    activeUnitId?: string;
}

interface ModeContextType {
    role: AppRole;
    setRole: (role: AppRole) => void;
    userProfile: UserProfile;
    setActiveUnit: (unitId: string) => void;
}

const baseUserProfiles: Record<AppRole, UserProfile> = {
    public: { name: 'Cidadão', sector: '', role: 'Público' },
    admin_manager_medicamentos: { name: 'Roberto Almeida', sector: 'Medicamentos', role: 'Gerente', avatar: '/man-avatar-3.jpg' },
    admin_protocol: { name: 'Ana Souza', sector: 'Protocolo', role: 'Protocolista', avatar: '/woman-avatar-1.jpg' },
    company: {
        name: 'ExtraFarma Belém',
        sector: 'Empresa',
        role: 'Estabelecimento',
        avatar: '/company-avatar.png',
        companyId: '2026010042',
        units: [
            { id: 'unit-1', name: 'ExtraFarma Nazaré', cnpj: '12.345.678/0001-90', address: 'Av. Nazaré, 123', status: 'Regular' },
            { id: 'unit-2', name: 'ExtraFarma Umarizal', cnpj: '12.345.678/0002-80', address: 'Rua Domingos Marreiros, 456', status: 'Pendente' },
            { id: 'unit-3', name: 'ExtraFarma Batista Campos', cnpj: '12.345.678/0003-70', address: 'Praça Batista Campos, 789', status: 'Inativa' }
        ]
    },
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<AppRole>('public');
    const [activeUnitId, setActiveUnitId] = useState<string>('unit-1');

    const setActiveUnit = (unitId: string) => {
        setActiveUnitId(unitId);
    };

    const userProfile = {
        ...baseUserProfiles[role],
        activeUnitId: role === 'company' ? activeUnitId : undefined
    };

    return (
        <ModeContext.Provider value={{ role, setRole, userProfile, setActiveUnit }}>
            {children}
        </ModeContext.Provider>
    );
};

export const useMode = () => {
    const context = useContext(ModeContext);
    if (context === undefined) {
        throw new Error('useMode must be used within a ModeProvider');
    }
    return context;
};
