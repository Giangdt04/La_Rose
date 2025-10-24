package com.larose.util;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.larose.entity.Booking;
import com.larose.entity.Transaction;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
public class InvoicePdfUtil {
    private static final String FONT_PATH = "src/main/resources/fonts/DejaVuSans.ttf";
    private static final String LOGO_PATH = "src/main/resources/images/logo.png";

    public static File generateInvoicePdf(Booking booking, Transaction transaction) {
        try {
            File file = File.createTempFile("invoice_" + booking.getId() + "_", ".pdf");

            NumberFormat currencyFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            Document document = new Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(document, new FileOutputStream(file));
            document.open();

            BaseFont bf = BaseFont.createFont(FONT_PATH, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            Font titleFont = new Font(bf, 16, Font.BOLD);
            Font headerFont = new Font(bf, 12, Font.BOLD);
            Font normalFont = new Font(bf, 11, Font.NORMAL);
            Font smallFont = new Font(bf, 9, Font.NORMAL);

            // Header
            PdfPTable headerTable = new PdfPTable(new float[]{1f, 2f});
            headerTable.setWidthPercentage(100);
            headerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            try {
                Image logo = Image.getInstance(LOGO_PATH);
                logo.scaleToFit(80, 80);
                PdfPCell logoCell = new PdfPCell(logo, false);
                logoCell.setBorder(Rectangle.NO_BORDER);
                headerTable.addCell(logoCell);
            } catch (Exception e) {
                PdfPCell logoCell = new PdfPCell(new Phrase(""));
                logoCell.setBorder(Rectangle.NO_BORDER);
                headerTable.addCell(logoCell);
            }

            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(Rectangle.NO_BORDER);
            infoCell.addElement(new Paragraph("La Rose Hotel", headerFont));
            infoCell.addElement(new Paragraph("Địa chỉ: Số X, Đường Y, Quận Z, Hà Nội", normalFont));
            infoCell.addElement(new Paragraph("Hotline: 0123 456 789", normalFont));
            infoCell.addElement(new Paragraph(" "));
            Paragraph invoiceTitle = new Paragraph("HÓA ĐƠN THANH TOÁN", titleFont);
            invoiceTitle.setAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(invoiceTitle);
            headerTable.addCell(infoCell);

            document.add(headerTable);
            document.add(Chunk.NEWLINE);

            // Thông tin khách hàng
            PdfPTable infoTable = new PdfPTable(new float[]{1f, 1f});
            infoTable.setWidthPercentage(100);

            PdfPCell left = new PdfPCell();
            left.setPadding(8f);
            left.addElement(new Paragraph("Khách hàng:", headerFont));
            left.addElement(new Paragraph(booking.getUser().getFullName(), normalFont));
            left.addElement(new Paragraph("Email: " + booking.getUser().getEmail(), normalFont));
            left.addElement(new Paragraph("Số điện thoại: " + (booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "-"), normalFont));

            PdfPCell right = new PdfPCell();
            right.setPadding(8f);
            right.addElement(new Paragraph("Mã hóa đơn:", headerFont));
            right.addElement(new Paragraph(String.valueOf(booking.getId()), normalFont));
            right.addElement(new Paragraph("Ngày thanh toán:", headerFont));
            right.addElement(new Paragraph(transaction.getCreatedAt().format(dtf), normalFont));

            infoTable.addCell(left);
            infoTable.addCell(right);
            document.add(infoTable);

            // Chi tiết
            PdfPTable table = new PdfPTable(new float[]{4f, 2f, 2f, 2f});
            table.setWidthPercentage(100);
            addCell(table, "Mô tả", headerFont, Element.ALIGN_LEFT, true);
            addCell(table, "Đơn giá", headerFont, Element.ALIGN_RIGHT, true);
            addCell(table, "Số lượng", headerFont, Element.ALIGN_CENTER, true);
            addCell(table, "Thành tiền", headerFont, Element.ALIGN_RIGHT, true);

            String desc = booking.getRoom().getTitle() + " (" + booking.getRoom().getRoomType().getName() + ")";
            long quantity = booking.getNights() > 0 ? booking.getNights() : 1;
            BigDecimal lineTotal = booking.getPriceTotal();

            addCell(table, desc, normalFont, Element.ALIGN_LEFT, false);
            addCell(table, String.valueOf(quantity), normalFont, Element.ALIGN_CENTER, false);
            addCell(table, currencyFormat.format(lineTotal) + " VND", normalFont, Element.ALIGN_RIGHT, false);

            document.add(table);

            // Tổng tiền
            PdfPTable totalTable = new PdfPTable(new float[]{6f, 2f});
            totalTable.setWidthPercentage(100);
            addCell(totalTable, "", normalFont, Element.ALIGN_LEFT, false);
            addCell(totalTable, "Tổng cộng: " + currencyFormat.format(booking.getPriceTotal()) + " VND", headerFont, Element.ALIGN_RIGHT, false);
            document.add(totalTable);

            document.add(Chunk.NEWLINE);

            Paragraph thank = new Paragraph("Cảm ơn quý khách đã tin tưởng và lựa chọn La Rose Hotel!", normalFont);
            thank.setAlignment(Element.ALIGN_CENTER);
            document.add(thank);

            Paragraph note = new Paragraph("Hóa đơn này được tạo tự động và có giá trị xác nhận thanh toán.", smallFont);
            note.setAlignment(Element.ALIGN_CENTER);
            document.add(note);

            document.close();
            return file;
        } catch (Exception e) {
            log.error("Error generating invoice PDF", e);
            throw new RuntimeException("Error generating invoice PDF", e);
        }
    }

    /** Helper */
    private static void addCell(PdfPTable table, String text, Font font, int align, boolean header) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8f);
        cell.setHorizontalAlignment(align);
        if (header) {
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        }
        table.addCell(cell);
    }
}
