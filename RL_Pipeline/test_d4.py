import numpy as np

def transform_action(r, c, k):
    if k == 0:  # Identity
        return r, c
    elif k == 1:  # Rot90 CW
        return c, 14 - r
    elif k == 2:  # Rot180
        return 14 - r, 14 - c
    elif k == 3:  # Rot270 CW
        return 14 - c, r
    elif k == 4:  # Flip LR (horizontal)
        return r, 14 - c
    elif k == 5:  # Flip UD (vertical)
        return 14 - r, c
    elif k == 6:  # Transpose (main diagonal)
        return c, r
    elif k == 7:  # Anti-transpose
        return 14 - c, 14 - r
    else:
        raise ValueError(f"Unknown k={k}")

def transform_plane(plane, k):
    if k == 0:
        return plane.copy()
    elif k == 1:
        return np.rot90(plane, k=-1)
    elif k == 2:
        return np.rot90(plane, k=2)
    elif k == 3:
        return np.rot90(plane, k=1)
    elif k == 4:
        return np.fliplr(plane)
    elif k == 5:
        return np.flipud(plane)
    elif k == 6:
        return plane.T.copy()
    elif k == 7:
        return plane[::-1, ::-1].T.copy()

# Verify for all k that if plane[r, c] == 1, then transformed_plane[tr, tc] == 1
passed = True
for k in range(8):
    for r in range(15):
        for c in range(15):
            p = np.zeros((15, 15), dtype=int)
            p[r, c] = 1
            tp = transform_plane(p, k)
            tr, tc = transform_action(r, c, k)
            if tp[tr, tc] != 1 or tp.sum() != 1:
                print(f"FAILED for k={k}, r={r}, c={c} -> tr={tr}, tc={tc}")
                passed = False
                break
        if not passed:
            break

if passed:
    print("ALL 8 D4 SYMMETRIES VERIFIED 100% CORRECT!")
