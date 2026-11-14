#!/usr/bin/env python3
"""
model.py
Dual-Head Residual Neural Network (ResNet) Architecture for Caro / Gomoku AI.

Architecture based on AlphaGo Zero / KataGo:
- Input: (B, 3, 15, 15) canonical board tensor.
- Conv Stem: 3 -> 64 channels, kernel 3x3, padding 1.
- ResNet Backbone: 6 Residual Blocks with skip connections.
- Policy Head: Predicts probability distribution over 225 board positions.
- Value Head: Predicts expected game outcome in [-1, +1] from current player's perspective.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class ResBlock(nn.Module):
    def __init__(self, channels=64):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        residual = x
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return F.relu(out)

class DualHeadResNet(nn.Module):
    def __init__(self, num_blocks=6, num_channels=64):
        super().__init__()
        self.num_blocks = num_blocks
        self.num_channels = num_channels

        # Initial Stem
        self.conv_stem = nn.Conv2d(3, num_channels, kernel_size=3, padding=1, bias=False)
        self.bn_stem = nn.BatchNorm2d(num_channels)

        # Residual Tower
        self.blocks = nn.ModuleList([ResBlock(num_channels) for _ in range(num_blocks)])

        # Policy Head
        self.policy_conv = nn.Conv2d(num_channels, 32, kernel_size=1, bias=False)
        self.policy_bn = nn.BatchNorm2d(32)
        self.policy_fc = nn.Linear(32 * 15 * 15, 225)

        # Value Head
        self.value_conv = nn.Conv2d(num_channels, 16, kernel_size=1, bias=False)
        self.value_bn = nn.BatchNorm2d(16)
        self.value_fc1 = nn.Linear(16 * 15 * 15, 128)
        self.value_fc2 = nn.Linear(128, 1)

    def forward(self, x):
        """
        x: (B, 3, 15, 15)
        Returns:
            policy_logits: (B, 225)
            value: (B, 1) in [-1, +1]
        """
        out = F.relu(self.bn_stem(self.conv_stem(x)))
        for block in self.blocks:
            out = block(out)

        # Policy computation
        p = F.relu(self.policy_bn(self.policy_conv(out)))
        p = p.view(p.size(0), -1)
        policy_logits = self.policy_fc(p)

        # Value computation
        v = F.relu(self.value_bn(self.value_conv(out)))
        v = v.view(v.size(0), -1)
        v = F.relu(self.value_fc1(v))
        value = torch.tanh(self.value_fc2(v))

        return policy_logits, value

    def predict(self, state_tensor, legal_mask=None):
        """
        Inference helper:
        Returns normalized policy probabilities (masked) and scalar value.
        """
        self.eval()
        with torch.no_grad():
            if state_tensor.dim() == 3:
                state_tensor = state_tensor.unsqueeze(0)
            logits, value = self.forward(state_tensor)
            if legal_mask is not None:
                logits[~legal_mask] = -1e9
            probs = F.softmax(logits, dim=-1)
            return probs.squeeze(0).cpu().numpy(), value.squeeze().item()

if __name__ == "__main__":
    net = DualHeadResNet(num_blocks=6, num_channels=64)
    dummy_input = torch.randn(4, 3, 15, 15)
    p_logits, v = net(dummy_input)
    print("DualHeadResNet sanity check passed:")
    print(f"Input shape: {dummy_input.shape}")
    print(f"Policy logits shape: {p_logits.shape} (Expected: [4, 225])")
    print(f"Value shape: {v.shape} (Expected: [4, 1])")
    param_count = sum(p.numel() for p in net.parameters())
    print(f"Total trainable parameters: {param_count:,}")
