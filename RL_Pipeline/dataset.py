#!/usr/bin/env python3
"""
dataset.py
PyTorch Dataset & DataLoader for Caro / Gomoku AI Reinforcement Learning Pipeline.

Features:
- Match-level Train/Val splitting (prevents trajectory data leakage).
- Canonical 3-plane perspective-invariant board representation:
    Plane 0: Current player's stones
    Plane 1: Opponent's stones
    Plane 2: Player color indicator (1 for Black, 0 for White)
- Full Dihedral D4 symmetry augmentation (8 transformations) applied on-the-fly.
"""

import os
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader

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
        raise ValueError(f"Invalid symmetry index k={k}")

def transform_planes(planes, k):
    """
    planes: np.ndarray of shape (C, 15, 15)
    """
    if k == 0:
        return planes.copy()
    elif k == 1:
        return np.rot90(planes, k=-1, axes=(1, 2)).copy()
    elif k == 2:
        return np.rot90(planes, k=2, axes=(1, 2)).copy()
    elif k == 3:
        return np.rot90(planes, k=1, axes=(1, 2)).copy()
    elif k == 4:
        return np.flip(planes, axis=2).copy()
    elif k == 5:
        return np.flip(planes, axis=1).copy()
    elif k == 6:
        return np.transpose(planes, (0, 2, 1)).copy()
    elif k == 7:
        return np.transpose(planes[:, ::-1, ::-1], (0, 2, 1)).copy()

class GomokuRLDataset(Dataset):
    def __init__(self, npz_path, is_train=True, train_ratio=0.9, augment_d4=True, seed=42):
        super().__init__()
        assert os.path.exists(npz_path), f"File not found: {npz_path}"
        data = np.load(npz_path)

        self.match_ids = data['match_ids']
        self.ply_indices = data['ply_indices']
        self.boards = data['boards']
        self.players = data['players']
        self.actions = data['actions']
        self.profiles = data['profiles']
        self.values = data['values']
        self.augment_d4 = augment_d4

        # Group matches for match-level train/val split (0 leakage)
        unique_matches = np.unique(self.match_ids)
        rng = np.random.RandomState(seed)
        shuffled_matches = rng.permutation(unique_matches)

        split_idx = int(len(shuffled_matches) * train_ratio)
        if is_train:
            selected_matches = set(shuffled_matches[:split_idx])
        else:
            selected_matches = set(shuffled_matches[split_idx:])

        # Filter indices belonging to selected matches
        mask = np.isin(self.match_ids, list(selected_matches))
        self.indices = np.where(mask)[0]
        self.is_train = is_train

    def __len__(self):
        return len(self.indices)

    def __getitem__(self, idx):
        real_idx = self.indices[idx]
        b = self.boards[real_idx]
        p = self.players[real_idx]
        act = self.actions[real_idx]
        z = float(self.values[real_idx])

        # Canonical 3-plane encoding
        planes = np.zeros((3, 15, 15), dtype=np.float32)
        planes[0] = (b == p).astype(np.float32)       # My stones
        planes[1] = (b == (3 - p)).astype(np.float32) # Opponent stones
        planes[2] = 1.0 if p == 1 else 0.0           # Black flag

        r = act // 15
        c = act % 15

        if self.augment_d4 and self.is_train:
            k = np.random.randint(0, 8)
            planes = transform_planes(planes, k)
            tr, tc = transform_action(r, c, k)
            final_action = tr * 15 + tc
        else:
            final_action = act

        return (
            torch.from_numpy(planes),
            torch.tensor(final_action, dtype=torch.long),
            torch.tensor(z, dtype=torch.float32)
        )

def get_dataloaders(npz_path, batch_size=256, num_workers=4, augment_d4=True):
    train_ds = GomokuRLDataset(npz_path, is_train=True, augment_d4=augment_d4)
    val_ds = GomokuRLDataset(npz_path, is_train=False, augment_d4=False)

    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True
    )
    return train_loader, val_loader

if __name__ == "__main__":
    import sys
    npz_file = sys.argv[1] if len(sys.argv) > 1 else "gomoku_rl_base_324k.npz"
    if os.path.exists(npz_file):
        ds = GomokuRLDataset(npz_file, is_train=True)
        print(f"Dataset successfully loaded. Train samples: {len(ds):,}")
        s, a, v = ds[0]
        print(f"Sample 0 -> State shape: {s.shape}, Action: {a.item()}, Value: {v.item()}")
