#!/usr/bin/env python3
"""
build_docs.py
Converts Markdown research logs into academic-grade DOCX and PDF files
in accordance with Section 00 (IMRaD & Evidence Standards) of the thesis syllabus.
"""

import sys
import os
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
)
from reportlab.pdfgen import canvas

# --- Color Palette ---
COLOR_PRIMARY = RGBColor(26, 54, 93)     # Deep Navy (#1A365D)
COLOR_SECONDARY = RGBColor(43, 108, 176) # Slate Blue (#2B6CB0)
COLOR_TEXT = RGBColor(45, 55, 72)        # Charcoal (#2D3748)
COLOR_MUTED = RGBColor(113, 128, 150)    # Gray (#718096)
COLOR_BG_CODE = RGBColor(247, 250, 252)  # Soft Gray (#F7FAFC)

RL_PRIMARY = colors.HexColor('#1A365D')
RL_SECONDARY = colors.HexColor('#2B6CB0')
RL_TEXT = colors.HexColor('#2D3748')
RL_MUTED = colors.HexColor('#718096')
RL_BG_CODE = colors.HexColor('#F7FAFC')
RL_BORDER = colors.HexColor('#CBD5E0')


class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total page count dynamically for PDF footers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(RL_MUTED)
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(85, A4[1] - 40, "VNUK Institute — Basic Project Research Log & Thesis Evidence")
            self.setStrokeColor(RL_BORDER)
            self.setLineWidth(0.5)
            self.line(85, A4[1] - 45, A4[0] - 56, A4[1] - 45)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 56, 35, footer_text)
        self.drawString(85, 35, "Standard 00 (IMRaD & Evidence Specification)")
        self.setStrokeColor(RL_BORDER)
        self.setLineWidth(0.5)
        self.line(85, 45, A4[0] - 56, 45)
        self.restoreState()


def parse_markdown(md_text):
    """
    Robust Markdown line parser that extracts:
    - headings (h1, h2, h3, h4)
    - code blocks (with language)
    - tables
    - lists (bullet, numbered)
    - blockquotes
    - standard paragraphs
    """
    lines = md_text.split('\n')
    blocks = []
    i = 0
    n = len(lines)
    
    while i < n:
        line = lines[i]
        stripped = line.strip()
        
        # Blank line
        if not stripped:
            i += 1
            continue
            
        # Code block
        if stripped.startswith('```'):
            lang = stripped[3:].strip()
            code_lines = []
            i += 1
            while i < n and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            if i < n:
                i += 1
            blocks.append({'type': 'code', 'lang': lang, 'content': '\n'.join(code_lines)})
            continue
            
        # Headings
        if stripped.startswith('# '):
            blocks.append({'type': 'h1', 'content': stripped[2:].strip()})
            i += 1
            continue
        if stripped.startswith('## '):
            blocks.append({'type': 'h2', 'content': stripped[3:].strip()})
            i += 1
            continue
        if stripped.startswith('### '):
            blocks.append({'type': 'h3', 'content': stripped[4:].strip()})
            i += 1
            continue
        if stripped.startswith('#### '):
            blocks.append({'type': 'h4', 'content': stripped[5:].strip()})
            i += 1
            continue
            
        # Markdown Table
        if stripped.startswith('|') and '|' in stripped[1:]:
            table_lines = []
            while i < n and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            blocks.append({'type': 'table', 'rows': table_lines})
            continue
            
        # Blockquote
        if stripped.startswith('>'):
            quote_lines = []
            while i < n and (lines[i].strip().startswith('>') or (lines[i].strip() and quote_lines)):
                if lines[i].strip().startswith('>'):
                    quote_lines.append(lines[i].strip()[1:].strip())
                elif lines[i].strip():
                    quote_lines.append(lines[i].strip())
                else:
                    break
                i += 1
            blocks.append({'type': 'quote', 'content': ' '.join(quote_lines)})
            continue
            
        # Bullet list
        if stripped.startswith('- ') or stripped.startswith('* '):
            list_items = []
            while i < n and (lines[i].strip().startswith('- ') or lines[i].strip().startswith('* ')):
                list_items.append(lines[i].strip()[2:].strip())
                i += 1
            blocks.append({'type': 'bullet_list', 'items': list_items})
            continue
            
        # Numbered list
        m_num = re.match(r'^\d+\.\s+(.*)', stripped)
        if m_num:
            list_items = []
            while i < n and re.match(r'^\d+\.\s+(.*)', lines[i].strip()):
                m = re.match(r'^\d+\.\s+(.*)', lines[i].strip())
                list_items.append(m.group(1).strip())
                i += 1
            blocks.append({'type': 'numbered_list', 'items': list_items})
            continue
            
        # Regular paragraph (multi-line until blank or special line)
        para_lines = []
        while i < n and lines[i].strip() and not lines[i].strip().startswith('#') \
                and not lines[i].strip().startswith('```') and not lines[i].strip().startswith('|') \
                and not lines[i].strip().startswith('>') and not lines[i].strip().startswith('- ') \
                and not re.match(r'^\d+\.\s+', lines[i].strip()):
            para_lines.append(lines[i].strip())
            i += 1
        blocks.append({'type': 'para', 'content': ' '.join(para_lines)})
        
    return blocks


def clean_markdown_inline(text):
    """Converts inline markdown formatting into plain text."""
    text = re.sub(r'<[^>]+>', '', text)
    return text


def build_docx(blocks, output_path, title="Research Report"):
    """Builds a formatted Word DOCX document."""
    doc = docx.Document()
    
    # Page setup: A4 portrait, Left: 3cm, Right: 2cm, Top: 2cm, Bottom: 2cm
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.left_margin = Inches(1.18)   # ~3.0 cm
        section.right_margin = Inches(0.79)  # ~2.0 cm
        section.top_margin = Inches(0.79)    # ~2.0 cm
        section.bottom_margin = Inches(0.79) # ~2.0 cm
        
    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = COLOR_TEXT
    
    for b in blocks:
        btype = b['type']
        
        if btype == 'h1':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_markdown_inline(b['content']))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = COLOR_PRIMARY
            
        elif btype == 'h2':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_markdown_inline(b['content']))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = COLOR_SECONDARY
            
        elif btype == 'h3':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(clean_markdown_inline(b['content']))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = COLOR_PRIMARY
            
        elif btype == 'h4':
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(clean_markdown_inline(b['content']))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.italic = True
            
        elif btype == 'para':
            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            _add_formatted_runs_docx(p, b['content'])
            
        elif btype == 'quote':
            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = 1.25
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(clean_markdown_inline(b['content']))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(11)
            run.font.italic = True
            run.font.color.rgb = COLOR_MUTED
            
        elif btype == 'bullet_list':
            for item in b['items']:
                p = doc.add_paragraph(style='List Bullet')
                p.paragraph_format.line_spacing = 1.25
                p.paragraph_format.space_after = Pt(3)
                _add_formatted_runs_docx(p, item)
                
        elif btype == 'numbered_list':
            for item in b['items']:
                p = doc.add_paragraph(style='List Number')
                p.paragraph_format.line_spacing = 1.25
                p.paragraph_format.space_after = Pt(3)
                _add_formatted_runs_docx(p, item)
                
        elif btype == 'code':
            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = 1.1
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.left_indent = Inches(0.2)
            run = p.add_run(b['content'])
            run.font.name = 'Courier New'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(30, 41, 59)
            
        elif btype == 'table':
            rows_data = []
            for r in b['rows']:
                cells = [c.strip() for c in r.strip('|').split('|')]
                if all(re.match(r'^:?-+:?$', c) for c in cells):
                    continue
                rows_data.append(cells)
            if rows_data:
                cols_count = max(len(r) for r in rows_data)
                table = doc.add_table(rows=len(rows_data), cols=cols_count)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                for ri, row in enumerate(rows_data):
                    for ci, cell in enumerate(row):
                        if ci < cols_count:
                            tc = table.cell(ri, ci)
                            tc.text = clean_markdown_inline(cell)
                            for p in tc.paragraphs:
                                p.paragraph_format.space_before = Pt(2)
                                p.paragraph_format.space_after = Pt(2)
                                p.paragraph_format.line_spacing = 1.15
                                for run in p.runs:
                                    run.font.name = 'Times New Roman'
                                    run.font.size = Pt(10)
                                    if ri == 0:
                                        run.font.bold = True
                doc.add_paragraph()
                
    doc.save(output_path)
    print(f"[DOCX] Generated: {output_path}")


def _add_formatted_runs_docx(paragraph, text):
    """Splits markdown inline syntax into docx runs."""
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`|\[[A-D]\])', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**'):
            run = paragraph.add_run(token[2:-2])
            run.bold = True
        elif token.startswith('*') and token.endswith('*'):
            run = paragraph.add_run(token[1:-1])
            run.italic = True
        elif token.startswith('`') and token.endswith('`'):
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Courier New'
            run.font.size = Pt(10)
        elif token in ('[A]', '[B]', '[C]', '[D]'):
            run = paragraph.add_run(f" {token} ")
            run.bold = True
            if token == '[A]':
                run.font.color.rgb = RGBColor(34, 84, 61)
            elif token == '[B]':
                run.font.color.rgb = RGBColor(42, 67, 101)
            elif token == '[C]':
                run.font.color.rgb = RGBColor(116, 66, 16)
            elif token == '[D]':
                run.font.color.rgb = RGBColor(85, 60, 154)
        else:
            paragraph.add_run(token)


def build_pdf(blocks, output_path, title="Research Report"):
    """Builds a formatted PDF document using ReportLab."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=85,   # ~3.0 cm
        rightMargin=56,  # ~2.0 cm
        topMargin=56,    # ~2.0 cm
        bottomMargin=56  # ~2.0 cm
    )
    
    styles = getSampleStyleSheet()
    
    h1_style = ParagraphStyle(
        'RepH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=RL_PRIMARY,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'RepH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=RL_SECONDARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    h3_style = ParagraphStyle(
        'RepH3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=RL_PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    h4_style = ParagraphStyle(
        'RepH4',
        parent=styles['Heading4'],
        fontName='Helvetica-BoldOblique',
        fontSize=9.5,
        leading=12,
        textColor=RL_TEXT,
        spaceBefore=6,
        spaceAfter=2
    )
    body_style = ParagraphStyle(
        'RepBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10,
        leading=14.5,
        textColor=RL_TEXT,
        alignment=4,  # Justified
        spaceAfter=6
    )
    quote_style = ParagraphStyle(
        'RepQuote',
        parent=styles['Normal'],
        fontName='Times-Italic',
        fontSize=9.5,
        leading=13.5,
        textColor=RL_MUTED,
        leftIndent=15,
        rightIndent=15,
        spaceBefore=4,
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        'RepBullet',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=9.5,
        leading=13.5,
        textColor=RL_TEXT,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )
    code_style = ParagraphStyle(
        'RepCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1E293B'),
        leftIndent=8,
        spaceBefore=3,
        spaceAfter=4
    )
    
    story = []
    
    for b in blocks:
        btype = b['type']
        
        if btype == 'h1':
            story.append(Paragraph(_escape_xml_inline(b['content']), h1_style))
        elif btype == 'h2':
            story.append(Paragraph(_escape_xml_inline(b['content']), h2_style))
        elif btype == 'h3':
            story.append(Paragraph(_escape_xml_inline(b['content']), h3_style))
        elif btype == 'h4':
            story.append(Paragraph(_escape_xml_inline(b['content']), h4_style))
        elif btype == 'para':
            story.append(Paragraph(_escape_xml_inline(b['content']), body_style))
        elif btype == 'quote':
            story.append(Paragraph(_escape_xml_inline(b['content']), quote_style))
        elif btype == 'bullet_list':
            for item in b['items']:
                bullet_text = f"&bull; {_escape_xml_inline(item)}"
                story.append(Paragraph(bullet_text, bullet_style))
        elif btype == 'numbered_list':
            for idx, item in enumerate(b['items'], 1):
                num_text = f"<b>{idx}.</b> {_escape_xml_inline(item)}"
                story.append(Paragraph(num_text, bullet_style))
        elif btype == 'code':
            code_text = b['content']
            lines = code_text.split('\n')
            if len(lines) > 30:
                code_text = '\n'.join(lines[:30]) + '\n... [truncated for print length] ...'
            p = Preformatted(code_text, code_style)
            t = Table([[p]], colWidths=[A4[0] - 141])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), RL_BG_CODE),
                ('BOX', (0, 0), (-1, -1), 0.5, RL_BORDER),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(Spacer(1, 3))
            story.append(t)
            story.append(Spacer(1, 4))
        elif btype == 'table':
            rows_data = []
            for r in b['rows']:
                cells = [c.strip() for c in r.strip('|').split('|')]
                if all(re.match(r'^:?-+:?$', c) for c in cells):
                    continue
                rows_data.append(cells)
            if rows_data:
                cols_count = max(len(r) for r in rows_data)
                col_width = (A4[0] - 141) / cols_count
                table_cells = []
                for ri, row in enumerate(rows_data):
                    table_row = []
                    for ci, cell in enumerate(row):
                        pstyle = ParagraphStyle(
                            f'TableCell_{ri}_{ci}',
                            parent=styles['Normal'],
                            fontName='Helvetica-Bold' if ri == 0 else 'Times-Roman',
                            fontSize=8.5 if ri == 0 else 8,
                            leading=10.5,
                            textColor=RL_PRIMARY if ri == 0 else RL_TEXT
                        )
                        table_row.append(Paragraph(_escape_xml_inline(cell), pstyle))
                    while len(table_row) < cols_count:
                        table_row.append(Paragraph('', styles['Normal']))
                    table_cells.append(table_row)
                    
                table = Table(table_cells, colWidths=[col_width] * cols_count)
                tstyle = [
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EDF2F7')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), RL_PRIMARY),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('INNERGRID', (0, 0), (-1, -1), 0.5, RL_BORDER),
                    ('BOX', (0, 0), (-1, -1), 0.5, RL_SECONDARY),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                    ('LEFTPADDING', (0, 0), (-1, -1), 4),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 4),
                ]
                table.setStyle(TableStyle(tstyle))
                story.append(Spacer(1, 4))
                story.append(table)
                story.append(Spacer(1, 6))
                
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[PDF] Generated: {output_path}")


def _escape_xml_inline(text):
    """Escapes special XML characters and converts Markdown syntax to HTML tags."""
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    text = re.sub(r'\[A\]', r'<b><font color="#22543D">[A]</font></b>', text)
    text = re.sub(r'\[B\]', r'<b><font color="#2A4365">[B]</font></b>', text)
    text = re.sub(r'\[C\]', r'<b><font color="#744210">[C]</font></b>', text)
    text = re.sub(r'\[D\]', r'<b><font color="#553C9A">[D]</font></b>', text)
    text = re.sub(r'`(.*?)`', r'<font face="Courier" size="8.5">\1</font>', text)
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
    return text


def convert_file(md_path):
    if not os.path.exists(md_path):
        print(f"Error: File not found {md_path}")
        return
        
    base_name = os.path.splitext(md_path)[0]
    docx_path = f"{base_name}.docx"
    pdf_path = f"{base_name}.pdf"
    
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    blocks = parse_markdown(content)
    title = os.path.basename(base_name).replace('_', ' ')
    
    print(f"Processing: {md_path} ({len(blocks)} blocks)")
    build_docx(blocks, docx_path, title=title)
    build_pdf(blocks, pdf_path, title=title)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 build_docs.py <path_to_markdown_file> [more_files...]")
        sys.exit(1)
        
    for arg in sys.argv[1:]:
        convert_file(arg)
