WEIGHTS = {
    "five": 10_000_000,
    "open_four": 100_000,
    "closed_four": 10_000,
    "open_three": 5_000,
    "closed_three": 1_000,
    "open_two": 500,
    "closed_two": 100
}

DEFENSIVE_MULTIPLIER = 1.2  # Ưu tiên phòng thủ 120%

def evaluate_position(bot_patterns, human_patterns):
    if bot_patterns.get("five", 0) > 0:
        return 10_000_000, "BOT_WIN (Thắng ngay)"
    if human_patterns.get("five", 0) > 0:
        return -9_999_999, "HUMAN_WIN (Thua ngay nếu không chặn)"

    atk_score = sum(WEIGHTS.get(k, 0) * v for k, v in bot_patterns.items())
    def_score = sum(int(WEIGHTS.get(k, 0) * DEFENSIVE_MULTIPLIER) * v for k, v in human_patterns.items())
    
    total = max(-9_999_999, min(9_999_999, atk_score - def_score))
    return total, f"Atk: +{atk_score:,} | Def Threat: -{def_score:,}"

s1, reason1 = evaluate_position({"open_four": 1}, {"open_three": 1})
print("=== KỊCH BẢN 1: Bot có Open Four vs Human có Open Three ===")
print(f"Tổng điểm Heuristic f(s) = {s1:,} ({reason1})")
print("-> Bot ưu tiên hoàn thành thế tấn công không thể cản phá.\\n")

s2, reason2 = evaluate_position({"open_three": 1}, {"closed_four": 1})
print("=== KỊCH BẢN 2: Đối thủ có Closed Four nguy hiểm ===")
print(f"Tổng điểm Heuristic f(s) = {s2:,} ({reason2})")
print("-> Điểm âm nặng do hệ số phòng thủ 1.2x buộc Bot phải chặn nước này trước.")
