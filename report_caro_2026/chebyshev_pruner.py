TOTAL_CELLS = 225

def simulate_chebyshev_pruning(existing_stones, radius=2):
    candidates = set()
    occupied = set(existing_stones)
    
    for (r, c) in existing_stones:
        for dr in range(-radius, radius + 1):
            for dc in range(-radius, radius + 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < 15 and 0 <= nc < 15:
                    if (nr, nc) not in occupied:
                        candidates.add((nr, nc))
                        
    empty_cells = TOTAL_CELLS - len(existing_stones)
    pruned_cells = empty_cells - len(candidates)
    reduction_pct = (pruned_cells / empty_cells) * 100
    return len(candidates), empty_cells, reduction_pct

stones = [(7, 7), (7, 8), (8, 7), (6, 8), (8, 8)]
cand_count, empty_count, reduction = simulate_chebyshev_pruning(stones, radius=2)

print("=== THỰC NGHIỆM CẮT GIẢM KHÔNG GIAN TÌM KIẾM CHEBYSHEV ===")
print(f"Kích thước bàn cờ: 15 x 15 = {TOTAL_CELLS} ô")
print(f"Số quân cờ đã đánh: {len(stones)} quân")
print(f"Số ô trống lý thuyết cần duyệt (Brute-Force): {empty_count} ô")
print(f"Số ô ứng viên sau lọc bán kính Chebyshev r <= 2: {cand_count} ô")
print(f"-> TỶ LỆ CẮT GIẢM KHÔNG GIAN: {reduction:.2f}%")
print(f"-> Giảm hệ số phân nhánh tìm kiếm từ {empty_count} xuống còn {cand_count} ô!")
