import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Complaint } from "./types";

/**
 * Generates a professional PDF receipt for a grievance report.
 */
export const generateGrievancePDF = async (complaint: Complaint) => {
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // Brand Header
    pdf.setFillColor(0, 51, 102); // MCD Navy
    pdf.rect(0, 0, 210, 40, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("CivicOS - Receipt", 20, 20);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("CivicOS National Portal", 20, 28);
    pdf.text("Digital Public Infrastructure", 20, 33);

    // Body
    pdf.setTextColor(30, 41, 59); // Slate 800
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Grievance Ticket: #${complaint.id}`, 20, 60);

    // Divider
    pdf.setDrawColor(226, 232, 240); // Slate 200
    pdf.line(20, 65, 190, 65);

    // Details Grid
    const details = [
        ["Category", complaint.category],
        ["Ward", complaint.ward],
        ["Assigned Dept", complaint.department],
        ["Priority", complaint.priority.toUpperCase()],
        ["Status", complaint.status],
        ["Date Reported", new Date(complaint.createdAt).toLocaleString()]
    ];

    let y = 80;
    details.forEach(([label, value]) => {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(148, 163, 184); // Slate 400
        pdf.text(label.toUpperCase(), 20, y);
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(30, 41, 59); // Slate 800
        pdf.text(value, 20, y + 6);
        y += 20;
    });

    // Description
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(148, 163, 184);
    pdf.text("ISSUE DESCRIPTION", 20, y);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(51, 65, 85);
    const splitDesc = pdf.splitTextToSize(complaint.description, 170);
    pdf.text(splitDesc, 20, y + 6);

    // Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(20, 270, 190, 270);
    
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text("This is an automatically generated receipt for your civic grievance submission through CivicOS.", 20, 278);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 283);

    pdf.save(`CivicOS-Receipt-${complaint.id}.pdf`);
};
