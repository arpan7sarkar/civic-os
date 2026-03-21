"use client";

import { OrganizationJsonLd, FAQJsonLd } from 'next-seo';

export default function SeoData() {
  return (
    <>
      <OrganizationJsonLd
        type="Organization"
        logo="/favicon.ico"
        url="https://civic-os-five.vercel.app"
        legalName="CivicOS National"
        name="CivicOS"
        address={{
          streetAddress: 'Sansad Marg',
          addressLocality: 'New Delhi',
          addressRegion: 'Delhi',
          postalCode: '110001',
          addressCountry: 'IN',
        }}
        contactPoint={[
          {
            telephone: '+91-11-23386447',
            contactType: 'customer service',
          },
        ]}
      />
      <FAQJsonLd
        questions={[
          {
            question: 'What is CivicOS National?',
            answer: 'CivicOS National is an AI-powered public infrastructure platform for India that allows citizens to report civic issues and track resolutions in real-time.',
          },
          {
            question: 'How can I report a civic issue?',
            answer: 'You can report an issue by logging into the CivicOS dashboard and using the AI Quick-Report tool to describe the problem.',
          },
          {
            question: 'Which departments are covered by CivicOS?',
            answer: 'CivicOS covers major municipal departments including Sanitation, Electrical, Roads, Public Health, Water, and Horticulture.',
          },
        ]}
      />
    </>
  );
}
