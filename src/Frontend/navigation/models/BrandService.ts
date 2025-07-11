export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
}

export interface BrandServiceModel {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  heroText: string;
  heroTextColor: string;
  footerText: string;
  domain: string;
  emailSender: string;
  isEmailActive: boolean;
  smtp: SmtpConfig;
  creativeImage: string;
  isDomainVerified: boolean;
  updatedAt: string;
  partnerId: number;
}