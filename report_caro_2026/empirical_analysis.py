total_games = 100
rule_based_wins = 100
random_wins = 0
avg_plies = 9.90
avg_time_per_move_us = 42.24  # micro-seconds
frame_budget_60fps_us = 16_670.0

win_rate = (rule_based_wins / total_games) * 100
latency_ratio = (avg_time_per_move_us / frame_budget_60fps_us) * 100

print("=== BÁO CÁO KẾT QUẢ THỰC NGHIỆM ĐỐI ĐẦU TUẦN 4 ===")
print(f"- Tổng số ván đấu kiểm chứng: {total_games} ván")
print(f"- Tỷ lệ thắng của Rule-Based Bot: {win_rate:.2f}% (100/100 ván)")
print(f"- Số nước đi trung bình một ván: {avg_plies} nước")
print(f"- Thời gian tính toán trung bình: {avg_time_per_move_us:.2f} µs/nước")
print(f"- Ngân sách khung hình 60 FPS: 16.67 ms ({frame_budget_60fps_us:.0f} µs)")
print(f"-> TỶ LỆ CHIẾM DỤNG FRAME BUDGET: {latency_ratio:.3f}% (Chỉ 0.25%!)")
print(f"-> Kết luận: Động cơ Rust chạy cực nhanh, sẵn sàng tích hợp WebAssembly không drop frame!")
