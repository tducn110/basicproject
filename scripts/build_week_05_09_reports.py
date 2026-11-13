#!/usr/bin/env python3
"""Build the five source-grounded research reports with native Word equations.

Run with the Codex bundled Python. Additional pure Python converters are
latex2mathml==3.78.1 and mathml2omml==0.0.2. PDF generation and visual review
use the documents skill renderer, separately, with bundled LibreOffice.
"""
from __future__ import annotations

import argparse
import re
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from lxml import etree
import latex2mathml.converter
import mathml2omml

ROOT = Path(__file__).resolve().parent.parent
MATH_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math"
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
FILES = [
    "Week5/Week_05_Rust_Minimax_Search_Tree_Analysis.md",
    "Week6/Week_06_Rust_Alpha_Beta_Pruning_and_Transposition_Tables.md",
    "Week7/Week_07_Candidate_Move_Generation.md",
    "Week8/Week_08_Move_Ordering_Optimization.md",
    "Week9/Week_09_Zobrist_Hashing_and_Transposition_Table.md",
]


def add_math(paragraph, latex: str, display: bool = False):
    """Convert TeX to native OMML; fail rather than emit unparsed TeX."""
    mathml = latex2mathml.converter.convert(latex.strip())
    omml = mathml2omml.convert(mathml)
    wrapped = f'<root xmlns:m="{MATH_NS}" xmlns:w="{WORD_NS}">{omml}</root>'
    element = etree.fromstring(wrapped.encode())[0]
    # Empty n-ary bounds must be hidden, otherwise Word/LibreOffice renders
    # an editable empty-slot square above a lower-bound-only summation.
    for nary in element.iter(qn("m:nary")):
        properties = nary.find(qn("m:naryPr"))
        if properties is None:
            properties = OxmlElement("m:naryPr")
            nary.insert(0, properties)
        for name in ("sub", "sup"):
            bound = nary.find(qn("m:"+name))
            if bound is None or not "".join(bound.itertext()).strip():
                hide = OxmlElement(f"m:{name}Hide")
                hide.set(qn("m:val"), "1")
                properties.append(hide)
    if display:
        block = OxmlElement("m:oMathPara")
        properties = OxmlElement("m:oMathParaPr")
        align = OxmlElement("m:jc")
        align.set(qn("m:val"), "center")
        properties.append(align)
        block.append(properties)
        block.append(element)
        paragraph._p.append(block)
        paragraph.paragraph_format.space_before = Pt(5)
        paragraph.paragraph_format.space_after = Pt(7)
    else:
        paragraph._p.append(element)


INLINE = re.compile(
    r"(\$[^$\n]+\$|\\\([^\n]*?\\\)|`[^`]+`|\*\*[^*]+\*\*|"
    r"\[[^\]]+\]\((?:[^()\n]|\([^()\n]*\))*\)|\*[^*\n]+\*)"
)


def add_link(paragraph, label: str, url: str):
    relationship = paragraph.part.relate_to(
        url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), relationship)
    run = OxmlElement("w:r")
    properties = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "245780")
    properties.append(color)
    run.append(properties)
    text = OxmlElement("w:t")
    text.text = label
    run.append(text)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def inline(paragraph, text: str):
    position = 0
    for match in INLINE.finditer(text):
        paragraph.add_run(text[position:match.start()])
        token = match.group()
        if token.startswith("$"):
            add_math(paragraph, token[1:-1])
        elif token.startswith(r"\("):
            add_math(paragraph, token[2:-2])
        elif token.startswith("`"):
            # Word can wrap path-like identifiers at separator boundaries.
            code = token[1:-1].replace("/", "/\u200b").replace("::", "::\u200b")
            run = paragraph.add_run(code)
            run.font.name = "DejaVu Sans Mono"
            run.font.size = Pt(9)
        elif token.startswith("**"):
            paragraph.add_run(token[2:-2]).bold = True
        elif token.startswith("*"):
            paragraph.add_run(token[1:-1]).italic = True
        else:
            label, url = re.match(r"\[([^\]]+)\]\((.*)\)$", token).groups()
            add_link(paragraph, label, url)
        position = match.end()
    paragraph.add_run(text[position:])


def table_cells(line: str):
    return [cell.strip().replace(r"\|", "|") for cell in re.split(r"(?<!\\)\|", line.strip().strip("|"))]


def add_table(doc, rows):
    count = len(rows[0])
    table = doc.add_table(rows=1, cols=count)
    table.autofit = False
    usable = doc.sections[0].page_width - doc.sections[0].left_margin - doc.sections[0].right_margin
    if count == 2:
        ratios = [0.30, 0.70]
    elif count == 3 and any("source" in c.lower() or "evidence" in c.lower() for c in rows[0]):
        ratios = [0.23, 0.38, 0.39]
    else:
        lengths = [max(len(row[c]) for row in rows if c < len(row)) for c in range(count)]
        weights = [max(12, min(45, n)) for n in lengths]
        ratios = [n/sum(weights) for n in weights]
    for column, ratio in zip(table.columns, ratios):
        column.width = int(usable*ratio)
    for row_index, values in enumerate(rows):
        row = table.rows[0] if row_index == 0 else table.add_row()
        props = row._tr.get_or_add_trPr()
        no_split = OxmlElement("w:cantSplit")
        props.append(no_split)
        if row_index == 0:
            props.append(OxmlElement("w:tblHeader"))
        for index, cell in enumerate(row.cells):
            cell.width = int(usable*ratios[index])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcpr = cell._tc.get_or_add_tcPr()
            margins = OxmlElement("w:tcMar")
            for side in ("top", "left", "bottom", "right"):
                edge = OxmlElement(f"w:{side}")
                edge.set(qn("w:w"), "85")
                edge.set(qn("w:type"), "dxa")
                margins.append(edge)
            tcpr.append(margins)
            borders = OxmlElement("w:tcBorders")
            for side in ("top", "left", "bottom", "right"):
                edge = OxmlElement(f"w:{side}")
                for name, value in (("val", "single"), ("sz", "4"), ("color", "D9D9D9")):
                    edge.set(qn("w:"+name), value)
                borders.append(edge)
            tcpr.append(borders)
            shade = OxmlElement("w:shd")
            shade.set(qn("w:fill"), "E9EEF2" if row_index == 0 else ("F6F8FA" if row_index%2 == 0 else "FFFFFF"))
            tcpr.append(shade)
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.space_after = Pt(2)
            paragraph.paragraph_format.line_spacing = 1.05
            value = values[index] if index < len(values) else ""
            inline(paragraph, value)
            for run in paragraph.runs:
                if not run.font.size:
                    run.font.size = Pt(9.5)
                if row_index == 0:
                    run.bold = True
            if re.fullmatch(r"[\d.,% +\-/]+", value):
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def configure(doc):
    for name in ("Normal", "Title", "Subtitle", "Heading 1", "Heading 2", "Heading 3", "Heading 4"):
        style = doc.styles[name]
        style.font.name = "Times New Roman"
        style.font.color.rgb = RGBColor(0, 0, 0)
        style.font.size = Pt({"Title":24,"Heading 1":15,"Heading 2":12.5,"Heading 3":11.5}.get(name,11))
        if style._element.pPr is not None:
            for border in list(style._element.pPr.findall(qn("w:pBdr"))):
                style._element.pPr.remove(border)
        style.paragraph_format.space_after = Pt(6)
        style.paragraph_format.line_spacing = 1.12
        if name.startswith("Heading"):
            style.paragraph_format.space_before = Pt(12)
            style.paragraph_format.keep_with_next = True
    doc.styles["Normal"].paragraph_format.widow_control = True
    doc.styles["Normal"].paragraph_format.space_after = Pt(5)
    doc.styles["Normal"].paragraph_format.line_spacing = 1.10
    for section in doc.sections:
        # Retain the existing reports' A4 page geometry and margins.
        for container in (section.header, section.footer):
            for paragraph in container.paragraphs:
                paragraph.clear()
        footer = section.footer.paragraphs[0]
        footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        run = footer.add_run("Page ")
        run.font.size = Pt(9)
        field = OxmlElement("w:fldSimple")
        field.set(qn("w:instr"), "PAGE")
        footer._p.append(field)


def build(path: Path):
    target = path.with_suffix(".docx")
    doc = Document(target) if target.exists() else Document()
    for child in list(doc._element.body):
        if child.tag != qn("w:sectPr"):
            doc._element.body.remove(child)
    configure(doc)
    lines = path.read_text().splitlines()
    i = 0
    equation_count = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or re.fullmatch(r"[-*_]{3,}", line):
            i += 1
            continue
        if line.startswith(("```", "~~~")):
            fence = line[:3]
            i += 1
            code = []
            while i < len(lines) and not lines[i].strip().startswith(fence):
                code.append(lines[i])
                i += 1
            for number, code_line in enumerate(code):
                p = doc.add_paragraph()
                p.paragraph_format.space_after = Pt(1)
                p.paragraph_format.line_spacing = 1.0
                p.paragraph_format.keep_with_next = number < len(code)-1
                p.paragraph_format.left_indent = Inches(.12)
                r = p.add_run(code_line)
                r.font.name = "DejaVu Sans Mono"
                r.font.size = Pt(8)
            i += 1
            continue
        if line.startswith("$$") or line == r"\[":
            marker = "$$" if line.startswith("$$") else r"\]"
            content = line[2:].removesuffix("$$").strip() if marker == "$$" else ""
            if line == "$$" or marker != "$$":
                math_lines = []
                i += 1
                while i < len(lines) and lines[i].strip() != marker:
                    math_lines.append(lines[i])
                    i += 1
                content = "\n".join(math_lines)
            p = doc.add_paragraph()
            add_math(p, content, True)
            equation_count += 1
            i += 1
            continue
        if line.startswith("|") and i+1 < len(lines) and re.match(r"\s*\|?\s*:?-{3}",lines[i+1]):
            rows = [table_cells(line)]
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(table_cells(lines[i]))
                i += 1
            add_table(doc, rows)
            continue
        heading = re.match(r"^(#{1,6})\s+(.*)", line)
        if heading:
            level = len(heading[1])
            p = doc.add_paragraph(style="Title" if level == 1 else f"Heading {min(level-1,4)}")
            inline(p, heading[2])
            i += 1
            continue
        is_list = re.match(r"^(?:[-*]|\d+\.)\s+",line)
        if is_list:
            prefix = "• " if line[0] in "-*" else re.match(r"^\d+\.\s+",line)[0]
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(.15)
            p.paragraph_format.first_line_indent = Inches(-.15)
            p.add_run(prefix)
            inline(p, line[is_list.end():])
            i += 1
            continue
        parts = [line.lstrip("> ")]
        previous_hard_break = lines[i].endswith("  ")
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#|\||\$\$|```|~~~|[-*] |\d+\. |\\\[)",lines[i].strip()):
            parts.append(("\n" if previous_hard_break else " ") + lines[i].strip())
            previous_hard_break = lines[i].endswith("  ")
            i += 1
        p = doc.add_paragraph()
        inline(p,"".join(parts))
    doc.core_properties.title = next((x[2:] for x in lines if x.startswith("# ")),path.stem)
    doc.core_properties.subject = "Caro AI algorithm research and reproducible evidence"
    doc.core_properties.author = ""
    doc.save(target)
    print(f"{target.relative_to(ROOT)} display_equations={equation_count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("files",nargs="*")
    args = parser.parse_args()
    for filename in args.files or FILES:
        build((ROOT/filename).resolve())
