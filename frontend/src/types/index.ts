export interface Organization {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    organization?: Organization;
}

export interface Asset {
    id: string;
    name: string;
    type: string;
    url?: string;
    category: string;
    riskScore: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    findings: string[];
    exposureScore: number;
    exploitabilityScore: number;
    businessImpactScore: number;
    temporalFactor: number;
}

export interface RiskHistory {
    date: string;
    score: number;
}

export interface Analysis {
    id: string;
    domain: string;
    overallRiskScore: number;
    overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    totalAssets: number;
    criticalAssets: number;
    highRiskAssets: number;
    mediumRiskAssets: number;
    lowRiskAssets: number;
    analyzedAt?: string;
    analyzed_at?: string; // Fallback
    createdAt?: string;
    created_at?: string; // Fallback
    assets?: Asset[];
    risk_histories?: RiskHistory[];
}
