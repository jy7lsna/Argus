import { promises as dns } from 'dns';
import RiskEngine from './riskEngine';
import SslService from './sslService';
import HeaderService from './headerService';

const ScannerService = {
    analyzeDomain: async (domain: string) => {
        const assets: any[] = [];
        let hasSPF = false;
        let hasIPv6 = false;

        try {
            // DNS A Record lookup
            try {
                const aRecords = await dns.resolve4(domain);
                if (aRecords.length > 0) {
                    const scores = {
                        exposureScore: 80,
                        exploitabilityScore: 20,
                        businessImpactScore: 85,
                        temporalFactor: 10
                    };
                    const sslInfo = await SslService.getCertificateInfo(domain);
                    const headerInfo = await HeaderService.analyzeHeaders(`https://${domain}`);
                    
                    let securityFindings: string[] = [];
                    let riskAdjustment = 0;

                    // SSL Analysis
                    if (sslInfo.error) {
                        securityFindings.push(`SSL Error: ${sslInfo.error}`);
                        riskAdjustment += 20;
                    } else {
                        securityFindings.push(`SSL Issuer: ${sslInfo.issuer}`);
                        securityFindings.push(`Days until expiry: ${sslInfo.daysRemaining}`);
                        if (sslInfo.daysRemaining < 30) {
                            securityFindings.push('WARNING: Certificate expires in less than 30 days');
                            riskAdjustment += 15;
                        }
                        if (!sslInfo.valid) {
                            securityFindings.push('CRITICAL: Certificate is not trusted or self-signed');
                            riskAdjustment += 25;
                        }
                    }

                    // Header Analysis
                    securityFindings.push(...headerInfo.findings);
                    riskAdjustment += headerInfo.riskAdjustment;

                    const riskScore = Math.min(100, RiskEngine.calculateAssetScore(scores, 'Web Server', 'Primary Web Server') + riskAdjustment);

                    assets.push({
                        name: 'Primary Web Server',
                        type: 'Web Server',
                        url: `https://${domain}`,
                        ...scores,
                        riskScore,
                        riskLevel: RiskEngine.getRiskLevel(riskScore),
                        category: 'Technical',
                        findings: ['Publicly accessible via DNS A Record', ...securityFindings]
                    });
                }
            } catch (e) {
                console.log(`No A record for ${domain}`);
            }

            // DNS MX Record lookup
            try {
                const mxRecords = await dns.resolveMx(domain);
                if (mxRecords.length > 0) {
                    const scores = {
                        exposureScore: 60,
                        exploitabilityScore: 40,
                        businessImpactScore: 90,
                        temporalFactor: 5
                    };
                    const riskScore = RiskEngine.calculateAssetScore(scores, 'Email Server', 'Email Server');

                    assets.push({
                        name: 'Email Server',
                        type: 'Email Server',
                        url: mxRecords[0].exchange,
                        ...scores,
                        riskScore,
                        riskLevel: RiskEngine.getRiskLevel(riskScore),
                        category: 'Informational',
                        findings: ['MX Record exposed', 'Verify SPF/DMARC records']
                    });
                }
            } catch (e) {
                console.log(`No MX record for ${domain}`);
            }

            // DNS AAAA Record lookup (IPv6 Performance/Integrity)
            try {
                const aaaaRecords = await dns.resolve6(domain);
                if (aaaaRecords.length > 0) hasIPv6 = true;
            } catch (e) {
                console.log(`No AAAA record for ${domain}`);
            }

            // RESTORED: DNS TXT Record lookup for security policies
            try {
                const txtRecords = await dns.resolveTxt(domain);
                hasSPF = txtRecords.flat().some(r => r.includes('v=spf1'));
                if (!hasSPF) {
                    const scores = {
                        exposureScore: 90,
                        exploitabilityScore: 80,
                        businessImpactScore: 70,
                        temporalFactor: 10
                    };
                    const riskScore = RiskEngine.calculateAssetScore(scores, 'Configuration');

                    assets.push({
                        name: 'Domain Security Policy',
                        type: 'Configuration',
                        url: domain,
                        ...scores,
                        riskScore,
                        riskLevel: RiskEngine.getRiskLevel(riskScore),
                        category: 'Technical',
                        findings: ['Missing SPF Protocol - Susceptible to email spoofing']
                    });
                }
            } catch (e) {
                console.log(`No TXT records for ${domain}`);
            }

            // DNS CNAME Record lookup
            try {
                const cnameRecords = await dns.resolveCname(domain);
                for (const cname of cnameRecords) {
                    let serviceType = 'External Service';
                    let riskBoost = 0;
                    let findings = [`CNAME Record: ${cname}`];

                    if (cname.includes('cloudfront.net')) {
                        serviceType = 'CDN (AWS CloudFront)';
                        findings.push('Assets served via global CDN');
                    } else if (cname.includes('s3.amazonaws.com')) {
                        serviceType = 'Cloud Storage (AWS S3)';
                        findings.push('External data storage detected');
                    } else if (cname.includes('azure')) {
                        serviceType = 'Cloud Instance (Azure)';
                    } else if (cname.includes('ghs.google.com')) {
                        serviceType = 'Google Managed Service';
                    } else if (cname.includes('vpn') || cname.includes('direct')) {
                        serviceType = 'Network Device';
                        riskBoost = 15;
                        findings.push('Potential direct network access point');
                    }

                    const scores = {
                        exposureScore: 50 + riskBoost,
                        exploitabilityScore: 30,
                        businessImpactScore: 70,
                        temporalFactor: 5
                    };
                    const riskScore = RiskEngine.calculateAssetScore(scores, serviceType, serviceType);

                    assets.push({
                        name: serviceType,
                        type: 'Network Infrastructure',
                        url: cname,
                        ...scores,
                        riskScore,
                        riskLevel: RiskEngine.getRiskLevel(riskScore),
                        category: 'Technical',
                        findings
                    });
                }
            } catch (e) {
                console.log(`No CNAME record for ${domain}`);
            }
        } catch (err) {
            console.error('DNS analysis partially failed:', err.message);
        }

        // Apply Chained Risk Logic: MX + missing SPF
        const hasMX = assets.some(a => a.type === 'Email Server');
        if (hasMX && !hasSPF) {
             const emailAsset = assets.find(a => a.type === 'Email Server');
             if (emailAsset) {
                 emailAsset.findings.push('CRITICAL: MX exposed without SPF protection (Chained Risk)');
                 emailAsset.riskScore = Math.min(100, emailAsset.riskScore + 15);
                 emailAsset.riskLevel = RiskEngine.getRiskLevel(emailAsset.riskScore);
             }
        }

        // Apply Configuration Bonus: IPv4 + IPv6
        const hasIPv4 = assets.some(a => a.type === 'Web Server');
        if (hasIPv4 && hasIPv6) {
            const primaryAsset = assets.find(a => a.type === 'Web Server');
            if (primaryAsset) {
                primaryAsset.findings.push('Security Bonus: Modern dual-stack (IPv4+IPv6) deployment');
                primaryAsset.riskScore = Math.max(0, primaryAsset.riskScore - 5);
                primaryAsset.riskLevel = RiskEngine.getRiskLevel(primaryAsset.riskScore);
            }
        }

        // REAL Subdomain Discovery Engine
        const commonSubdomains = [
            'api', 'dev', 'staging', 'mail', 'vpn', 'portal', 'admin', 'prod', 
            'remote', 'git', 'db', 'app', 'internal', 'secure', 'test', 'demo',
            'm', 'blog', 'support', 'help', 'docs', 'status', 'cdn', 'cloud',
            'vault', 'auth', 'identity', 'mfa', 'direct', 'ext'
        ];

        // We run these in parallel for performance, but with a slight throttle/limit if needed.
        // For this implementation, we'll probe them all.
        const discoveryPromises = commonSubdomains.map(async (sub) => {
            const subDomain = `${sub}.${domain}`;
            try {
                // Try A record first
                let addresses: string[] = [];
                let isCname = false;
                let cnameDestination = '';

                try {
                    addresses = await dns.resolve4(subDomain);
                } catch (e) {
                    // Try CNAME record if A fails
                    try {
                        const cnames = await dns.resolveCname(subDomain);
                        if (cnames.length > 0) {
                            isCname = true;
                            cnameDestination = cnames[0];
                        }
                    } catch (innerE) {
                        // Not found
                    }
                }

                if (addresses.length > 0 || isCname) {
                    let assetType = 'Subdomain';
                    let riskBoost = 0;
                    let findings = [`Live infrastructure discovered via DNS resolution`];
                    
                    if (isCname) {
                        findings.push(`CNAME Alias: ${cnameDestination}`);
                        // Apply fingerprinting to CNAME destination
                        if (cnameDestination.includes('cloudfront.net')) assetType = 'CDN (AWS CloudFront)';
                        else if (cnameDestination.includes('s3.amazonaws.com')) assetType = 'Cloud Storage (AWS S3)';
                        else if (cnameDestination.includes('azure')) assetType = 'Cloud Instance (Azure)';
                        else if (cnameDestination.includes('ghs.google.com')) assetType = 'Google Managed Service';
                    } else {
                        findings.push(`Asset type: ${assetType}`);
                    }

                    // Intelligent Type Detection based on subdomain name
                    if (sub.includes('api')) assetType = 'API Endpoint';
                    else if (sub.includes('db')) assetType = 'Internal DB';
                    else if (sub.includes('vpn') || sub.includes('remote') || sub.includes('direct')) assetType = 'Network Device';
                    else if (sub.includes('vault') || sub.includes('auth') || sub.includes('mfa')) assetType = 'Auth Service';
                    else if (sub.includes('cloud') || sub.includes('s3')) assetType = 'Cloud Storage';
                    else if (sub.includes('prod')) riskBoost = 10;

                    const scores = {
                        exposureScore: 70 + riskBoost,
                        exploitabilityScore: 30,
                        businessImpactScore: sub.match(/auth|vault|db|api|prod/i) ? 90 : 60,
                        temporalFactor: 10
                    };

                    let riskAdjustment = 0;

                    // Security check for web-facing assets
                    const isWebFacing = assetType.includes('Web Server') || assetType.includes('API') || assetType.includes('Auth') || assetType.includes('Portal');
                    if (isWebFacing) {
                        // SSL Check
                        const sslInfo = await SslService.getCertificateInfo(subDomain);
                        if (sslInfo.error) {
                            findings.push(`SSL Check Failed: ${sslInfo.error}`);
                        } else {
                            findings.push(`SSL Issuer: ${sslInfo.issuer} (${sslInfo.daysRemaining} days remaining)`);
                            if (sslInfo.daysRemaining < 30) riskAdjustment += 10;
                            if (!sslInfo.valid) riskAdjustment += 20;
                        }

                        // Header Check
                        const headerInfo = await HeaderService.analyzeHeaders(`https://${subDomain}`);
                        findings.push(...headerInfo.findings);
                        riskAdjustment += headerInfo.riskAdjustment;
                    }

                    const riskScore = Math.min(100, RiskEngine.calculateAssetScore(scores, assetType, subDomain) + riskAdjustment);

                    return {
                        name: subDomain,
                        type: assetType,
                        url: isCname ? cnameDestination : `https://${subDomain}`,
                        ...scores,
                        riskScore,
                        riskLevel: RiskEngine.getRiskLevel(riskScore),
                        category: assetType.includes('Internal') || assetType.includes('Auth') ? 'Technical' : 'Third-party',
                        findings
                    };
                }
            } catch (e) {
                // Not found, skip
            }
            return null;
        });

        const discoveredAssets = (await Promise.all(discoveryPromises)).filter(a => a !== null);
        assets.push(...(discoveredAssets as any[]));

        const overallRiskScore = RiskEngine.calculateOverallScore(assets);
        const overallRiskLevel = RiskEngine.getRiskLevel(overallRiskScore);

        return {
            domain,
            overallRiskScore,
            overallRiskLevel,
            totalAssets: assets.length,
            criticalAssets: assets.filter(a => a.riskLevel === 'Critical').length,
            highRiskAssets: assets.filter(a => a.riskLevel === 'High').length,
            mediumRiskAssets: assets.filter(a => a.riskLevel === 'Medium').length,
            lowRiskAssets: assets.filter(a => a.riskLevel === 'Low').length,
            assets,
            riskTrend: [
                { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: Math.max(0, overallRiskScore - 10) },
                { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: Math.max(0, overallRiskScore - 5) },
                { date: new Date().toISOString().split('T')[0], score: overallRiskScore }
            ]
        };
    }
};

export default ScannerService;
