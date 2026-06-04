export interface FooterLink {
  label: string;
  url: string;
}

export interface SiteSetting {
  id: string;
  logoUrl: string | null;
  brandName: string | null;
  description: string | null;
  footerText: string | null;
  linksHeading: string | null;
  footerLinks: FooterLink[];
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UpdateSiteSettingData {
  logoUrl?: string | null;
  brandName?: string | null;
  description?: string | null;
  footerText?: string | null;
  linksHeading?: string | null;
  footerLinks?: FooterLink[];
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
  linkedinUrl?: string | null;
}
