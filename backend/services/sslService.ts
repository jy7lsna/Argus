import tls from 'tls';

export interface SslInfo {
    valid: boolean;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    error?: string;
}

const SslService = {
    getCertificateInfo: async (hostname: string, port: number = 443): Promise<SslInfo> => {
        return new Promise((resolve) => {
            const rejectUnauthorized = process.env.SSL_SCAN_REJECT_UNAUTHORIZED !== 'false';
            const options = {
                host: hostname,
                port: port,
                servername: hostname,
                rejectUnauthorized
            };

            const socket = tls.connect(options, () => {
                const cert = socket.getPeerCertificate();
                
                if (!cert || Object.keys(cert).length === 0) {
                    socket.destroy();
                    return resolve({
                        valid: false,
                        issuer: 'Unknown',
                        validFrom: '',
                        validTo: '',
                        daysRemaining: 0,
                        error: 'No certificate found'
                    });
                }

                const validTo = new Date(cert.valid_to);
                const validFrom = new Date(cert.valid_from);
                const now = new Date();
                const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                const getIssuerString = (val: string | string[] | undefined) => Array.isArray(val) ? val[0] : val || '';

                // Check if it's technically valid (not expired and authorized)
                // Note: socket.authorized is based on rejectUnauthorized being true, 
                // but since we set it to false, we check it manually or just report findings.
                const info: SslInfo = {
                    valid: socket.authorized,
                    issuer: getIssuerString(cert.issuer.O) || getIssuerString(cert.issuer.CN) || 'Unknown',
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    daysRemaining
                };

                socket.destroy();
                resolve(info);
            });

            socket.on('error', (err) => {
                resolve({
                    valid: false,
                    issuer: 'Unknown',
                    validFrom: '',
                    validTo: '',
                    daysRemaining: 0,
                    error: err.message
                });
            });

            // Set a timeout for the connection
            socket.setTimeout(5000);
            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    valid: false,
                    issuer: 'Unknown',
                    validFrom: '',
                    validTo: '',
                    daysRemaining: 0,
                    error: 'Connection timeout'
                });
            });
        });
    }
};

export default SslService;
