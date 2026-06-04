"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { siteConfig } from "@/config/site";
import { useT } from "@/lib/i18n";
import { buildSocialLinks } from "@/components/social-icons";

export function Footer() {
  const { data } = useSiteSettings();
  const t = useT();
  const year = new Date().getFullYear();

  const brandName = data?.brandName?.trim() || siteConfig.name;
  const copyright = data?.footerText?.trim() || t.footer.fallbackText(year);
  const links = data?.footerLinks ?? [];
  const linksHeading = data?.linksHeading?.trim() || t.footer.linksHeading;
  const socials = buildSocialLinks(data);

  const hasContact =
    data?.contactPhone || data?.contactEmail || data?.contactAddress;

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* ── Brand / description / social ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {data?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.logoUrl}
                  alt={brandName}
                  className="h-8 w-auto object-contain"
                />
              ) : null}
              <span className="text-lg font-semibold">{brandName}</span>
            </div>
            {data?.description?.trim() && (
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {data.description}
              </p>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="text-primary transition-opacity hover:opacity-70"
                  >
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Links column ── */}
          {links.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">{linksHeading}</h3>
              <ul className="flex flex-col gap-2">
                {links.map((link, i) => (
                  <li key={`${link.url}-${i}`}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Contact column ── */}
          {hasContact && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">{t.footer.contactHeading}</h3>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                {data?.contactPhone && (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0 text-primary" />
                    <a
                      href={`tel:${data.contactPhone}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {data.contactPhone}
                    </a>
                  </li>
                )}
                {data?.contactEmail && (
                  <li className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-primary" />
                    <a
                      href={`mailto:${data.contactEmail}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {data.contactEmail}
                    </a>
                  </li>
                )}
                {data?.contactAddress && (
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="whitespace-pre-line">
                      {data.contactAddress}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 border-t pt-6 text-right text-xs text-muted-foreground">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
