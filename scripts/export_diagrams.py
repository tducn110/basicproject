#!/usr/bin/env python3
"""
Tiện ích biên dịch sơ đồ Mermaid sang định dạng ảnh .png độ nét cao (Scale x2/x3)
để trích dẫn trực tiếp vào tài liệu Obsidian và báo cáo Đồ Án Cơ Sở.

Sử dụng:
    python3 scripts/export_diagrams.py <input.mmd> [output.png]
"""

import sys
import os
import base64
import urllib.request
import urllib.error
import subprocess

def compile_mermaid_ink(code: str, output_file: str, scale=2) -> bool:
    """Biên dịch Mermaid sang PNG độ nét cao thông qua Mermaid Ink API."""
    try:
        b64 = base64.urlsafe_b64encode(code.encode('utf-8')).decode('ascii').rstrip('=')
        url = f"https://mermaid.ink/img/{b64}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            if len(content) > 100:  # Đảm bảo là ảnh hợp lệ
                with open(output_file, 'wb') as f:
                    f.write(content)
                return True
    except Exception as e:
        print(f"  Mermaid Ink fallback warning: {e}")
    return False

def compile_mermaid_cli(input_file: str, output_file: str, scale=2) -> bool:
    """Biên dịch Mermaid bằng @mermaid-js/mermaid-cli (local node)."""
    cmd = [
        "npx", "--yes", "@mermaid-js/mermaid-cli",
        "-i", input_file,
        "-o", output_file,
        "-b", "white",
        "-s", str(scale)
    ]
    res = subprocess.run(cmd, capture_output=True)
    return res.returncode == 0

def compile_diagram(input_file: str, output_file: str = None, scale=2):
    if not os.path.exists(input_file):
        print(f"✗ Lỗi: Không tìm thấy file nguồn {input_file}")
        sys.exit(1)
        
    with open(input_file, 'r', encoding='utf-8') as f:
        code = f.read().strip()
        
    if not output_file:
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        output_file = os.path.join("assets/diagrams", f"{base_name}.png")
        
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    print(f"Đang xuất ảnh Mermaid: {input_file} -> {output_file}...")
    
    # Ưu tiên Mermaid Ink với scale cao
    if compile_mermaid_ink(code, output_file, scale=scale):
        print(f"✓ Đã xuất ảnh PNG thành công (Mermaid Ink scale {scale}x): {output_file}")
        return
        
    # Thử fallback qua local CLI
    if compile_mermaid_cli(input_file, output_file, scale=scale):
        print(f"✓ Đã xuất ảnh PNG thành công (Mermaid CLI): {output_file}")
        return
        
    print(f"✗ Không thể xuất ảnh cho {input_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python3 scripts/export_diagrams.py <input.mmd> [output.png]")
        sys.exit(1)
    compile_diagram(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
