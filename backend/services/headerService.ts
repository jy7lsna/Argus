import axios from 'axios';

export interface HeaderAnalysis {
    present: string[];
    missing: string[];
    findings: string[];
    riskAdjustment: number;
}

const HeaderService = {
    analyzeHeaders: async (url: string): Promise<HeaderAnalysis> => {
        const securityHeaders = [
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'X-Frame-Options',
            'X-Content-Type-Options',
            'Referrer-Policy',
            'Permissions-Policy'
        ];

        const results: HeaderAnalysis = {
            present: [],
            missing: [],
            findings: [],
            riskAdjustment: 0
        };

        try {
            // Use a short timeout and only HEAD request if possible for speed
            const response = await axios.head(url, { 
                timeout: 5000,
                validateStatus: () => true // Don't throw on 404/500
            });

            const headers = response.headers;

            securityHeaders.forEach(header => {
                const lowerHeader = header.toLowerCase();
                if (headers[lowerHeader]) {
                    results.present.push(header);
                } else {
                    results.missing.push(header);
                    
                    // Specific findings and risk weights
                    if (header === 'Strict-Transport-Security') {
                        results.findings.push('CRITICAL: HSTS header missing (Insecure transport)');
                        results.riskAdjustment += 15;
                    } else if (header === 'Content-Security-Policy') {
                        results.findings.push('HIGH: Content Security Policy (CSP) not implemented');
                        results.riskAdjustment += 10;
                    } else if (header === 'X-Frame-Options') {
                        results.findings.push('MEDIUM: X-Frame-Options missing (Clickjacking risk)');
                        results.riskAdjustment += 5;
                    }
                }
            });

            if (results.present.length > 0) {
                results.findings.push(`Security headers found: ${results.present.join(', ')}`);
            }

        } catch (error) {
            results.findings.push(`Header Check Failed: ${error.message}`);
            // Don't penalize too heavily for a connection failure here
        }

        return results;
    }
};

export default HeaderService;
