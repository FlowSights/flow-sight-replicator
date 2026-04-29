import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Ad {
  headline: string;
  description: string;
  cta: string;
  platform: string;
  imageUrl?: string;
}

interface CampaignKitData {
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  websiteUrl: string;
  ads: Ad[];
}

export const downloadPremiumCampaignKit = (data: CampaignKitData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const platform = data.ads[0]?.platform || 'Multi-Platform';
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  // --- Page 1: Cover ---
  // Dark Header
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FLOWSIGHT ADS', 20, 35);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM STRATEGIC DOSSIER', 20, 45);

  // Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Campaign Kit', 20, 100);
  doc.text(platformName, 20, 115);

  doc.setDrawColor(16, 185, 129); // Emerald-500
  doc.setLineWidth(2);
  doc.line(20, 125, 60, 125);

  // Info
  doc.setFontSize(14);
  doc.text(`Client: ${data.businessName}`, 20, 150);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 160);
  doc.text(`Website: ${data.websiteUrl}`, 20, 170);

  // Footer Page 1
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('CONFIDENTIAL STRATEGIC DOCUMENT', pageWidth / 2, 280, { align: 'center' });

  // --- Page 2: Executive Summary ---
  doc.addPage();
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Summary', 20, 30);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summary = `This strategic dossier outlines a comprehensive advertising campaign for ${data.businessName}. Our AI-driven optimization has identified high-performing messaging patterns tailored specifically for ${platformName}'s unique audience behavior.`;
  doc.text(doc.splitTextToSize(summary, pageWidth - 40), 20, 45);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Market Context', 20, 75);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.businessDescription, pageWidth - 40), 20, 85);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Target Audience', 20, 120);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(doc.splitTextToSize(data.targetAudience, pageWidth - 40), 20, 130);

  // --- Page 3: Creative Assets ---
  doc.addPage();
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Creative Assets & Copywriting', 20, 30);

  data.ads.forEach((ad, index) => {
    const yPos = 50 + (index * 70);
    if (yPos > 250) doc.addPage();
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPos - 10, pageWidth - 30, 60, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Ad Variant ${index + 1} - ${ad.platform.toUpperCase()}`, 25, yPos);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.text('Headline:', 25, yPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(ad.headline, pageWidth - 60), 50, yPos + 10);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Body Text:', 25, yPos + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(ad.description, pageWidth - 60), 50, yPos + 25);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Call to Action:', 25, yPos + 45);
    doc.setFont('helvetica', 'normal');
    doc.text(ad.cta, 55, yPos + 45);
  });

  // --- Page 4: Strategic Implementation ---
  doc.addPage();
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Strategic Implementation', 20, 30);

  const steps = [
    ['Phase', 'Action Item', 'Priority'],
    ['Setup', 'Pixel/API Conversion tracking installation', 'Critical'],
    ['Launch', 'A/B Testing variant rotation (7 days)', 'High'],
    ['Optimization', 'CPA scaling based on top-performing creative', 'High'],
    ['Retargeting', 'Custom audience creation from high-intent users', 'Medium']
  ];

  (doc as any).autoTable({
    startY: 45,
    head: [steps[0]],
    body: steps.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [15, 15, 15] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Consumer Psychology Analysis', 20, (doc as any).lastAutoTable.finalY + 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const psych = "Our AI has optimized these creatives using the 'Frictionless Conversion' framework, focusing on reducing cognitive load while maximizing emotional resonance with the target audience identified.";
  doc.text(doc.splitTextToSize(psych, pageWidth - 40), 20, (doc as any).lastAutoTable.finalY + 30);

  // Save
  doc.save(`FlowSight_Campaign_Kit_${data.businessName}_${platformName}.pdf`);
};
