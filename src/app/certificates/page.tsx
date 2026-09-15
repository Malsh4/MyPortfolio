import type { Metadata } from "next";
import CertificateGallery from "@/components/case/CertificateGallery";
import { profile } from "@/data/content";

export const metadata: Metadata = {
  title: `Certificates • ${profile.name}`,
  description: "Every certificate and credential earned by Amandi De Silva, with verification links.",
};

export default function CertificatesPage() {
  return <CertificateGallery />;
}
