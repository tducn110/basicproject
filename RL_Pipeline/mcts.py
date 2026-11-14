#!/usr/bin/env python3
"""
mcts.py
Phase 3: Policy-Value Guided Monte Carlo Tree Search (AlphaZero MCTS) for Caro / Gomoku AI.

Key Features:
- Polynomial Upper Confidence Trees (PUCT) action selection.
- Asynchronous / Instant Neural Network evaluation via Dual-Head ResNet-6.
- In-place Apply/Undo state manipulation for zero-allocation tree traversal.
- Dirichlet noise injection at root for exploratory self-play: Dir(alpha=0.03).
- Tactical instant-win / instant-block retention rule in tree expansion.
- Temperature-controlled visit count distribution: pi(a|s) proportional to N(s, a)^(1/tau).
"""

import math
import numpy as np
import torch
import torch.nn.functional as F

from extract_rl_dataset_10000 import OptGomoku, BLACK, WHITE, EMPTY

BOARD_SIZE = 15
TOTAL_CELLS = 225

class MCTSNode:
    __slots__ = ['parent', 'action', 'children', 'visit_count', 'total_value', 'prior', 'is_expanded']

    def __init__(self, parent=None, action=None, prior=0.0):
        self.parent = parent
        self.action = action            # 1D index (0..224)
        self.children = {}              # action -> MCTSNode
        self.visit_count = 0            # N(s, a)
        self.total_value = 0.0          # W(s, a)
        self.prior = float(prior)       # P(s, a)
        self.is_expanded = False

    @property
    def q_value(self):
        """Mean action-value Q(s, a)."""
        if self.visit_count == 0:
            return 0.0
        return self.total_value / self.visit_count

    def puct_score(self, c_puct, parent_visit_sum_sqrt):
        """
        Computes PUCT acquisition score:
        Q(s, a) + c_puct * P(s, a) * sqrt(sum_b N(s, b)) / (1 + N(s, a))
        """
        u = c_puct * self.prior * parent_visit_sum_sqrt / (1.0 + self.visit_count)
        return self.q_value + u

    def select_child(self, c_puct):
        """Selects child with maximum PUCT score."""
        parent_visit_sum_sqrt = math.sqrt(max(1, self.visit_count))
        best_score = -float('inf')
        best_child = None

        for child in self.children.values():
            score = child.puct_score(c_puct, parent_visit_sum_sqrt)
            if score > best_score:
                best_score = score
                best_child = child

        return best_child

    def expand(self, action_priors):
        """
        Expands node with child nodes for legal actions.
        action_priors: dict or list of (action, prior)
        """
        self.is_expanded = True
        for act, prior in action_priors.items():
            if act not in self.children:
                self.children[act] = MCTSNode(parent=self, action=act, prior=prior)

    def backup(self, value):
        """
        Recursively backpropagates leaf evaluation up to the root.
        Alternates perspective sign (-value) at each ply.
        """
        node = self
        curr_v = value
        while node is not None:
            node.visit_count += 1
            node.total_value += curr_v
            node = node.parent
            curr_v = -curr_v

class AlphaZeroMCTS:
    """
    AlphaZero Monte Carlo Tree Search Engine.
    Combines deep deliberation search with Dual-Head ResNet intuition.
    """
    def __init__(self, model, device, c_puct=2.0, num_simulations=100,
                 dirichlet_alpha=0.03, dirichlet_eps=0.25):
        self.model = model
        self.device = device
        self.c_puct = c_puct
        self.num_simulations = num_simulations
        self.dirichlet_alpha = dirichlet_alpha
        self.dirichlet_eps = dirichlet_eps

    def _encode_board_tensor(self, game, player):
        """
        Encodes board into canonical 3-plane tensor (1, 3, 15, 15).
        Plane 0: My stones
        Plane 1: Opponent stones
        Plane 2: 1.0 if Black, 0.0 if White
        """
        b_arr = np.array(game.board, dtype=np.int32)
        planes = np.zeros((1, 3, 15, 15), dtype=np.float32)
        planes[0, 0] = (b_arr == player).astype(np.float32)
        planes[0, 1] = (b_arr == (3 - player)).astype(np.float32)
        planes[0, 2] = 1.0 if player == BLACK else 0.0
        return torch.from_numpy(planes).to(self.device)

    def _evaluate_state(self, game, player):
        """
        Evaluates state using DualHeadResNet.
        Returns:
          priors: dict of legal_action -> probability
          value: scalar in [-1, +1] from current player's perspective
        """
        tensor = self._encode_board_tensor(game, player)
        with torch.no_grad():
            p_logits, v_pred = self.model(tensor)
            probs = F.softmax(p_logits, dim=-1).squeeze(0).cpu().numpy()
            value = float(v_pred.item())

        # Determine legal actions (empty cells)
        legal_actions = []
        for r in range(BOARD_SIZE):
            for c in range(BOARD_SIZE):
                if game.board[r][c] == EMPTY:
                    legal_actions.append(r * 15 + c)

        if not legal_actions:
            return {}, 0.0

        # Filter and renormalize probabilities over legal candidate moves
        # For efficiency, if board has stones, restrict candidates to Chebyshev radius 2
        candidate_moves = game.get_candidate_moves(max_cands=32)
        cand_indices = set(r * 15 + c for r, c in candidate_moves)

        sub_probs = {}
        total_p = 0.0
        for act in legal_actions:
            # Keep action if in candidate moves, or if candidate list is small
            if act in cand_indices:
                p = float(probs[act])
                sub_probs[act] = p
                total_p += p

        if total_p > 1e-7:
            for act in sub_probs:
                sub_probs[act] /= total_p
        else:
            uniform_p = 1.0 / len(sub_probs) if sub_probs else 1.0 / len(legal_actions)
            for act in (sub_probs or legal_actions):
                sub_probs[act] = uniform_p

        return sub_probs, value

    def search(self, game, current_player, add_dirichlet_noise=False):
        """
        Executes num_simulations MCTS iterations from the given state.
        Returns root MCTSNode containing search statistics.
        """
        root = MCTSNode()

        # Tactical Resolution Rule 1: Instant Self-Win
        # If current player can win immediately on this move, take it!
        cand_moves = game.get_candidate_moves(max_cands=32)
        for r, c in cand_moves:
            game.place(r, c, current_player)
            is_win = game.check_win(r, c)
            game.unplace(r, c, current_player)
            if is_win:
                act = r * 15 + c
                root.expand({act: 1.0})
                root.children[act].visit_count = self.num_simulations * 10
                root.children[act].total_value = float(self.num_simulations * 10)
                return root

        # Tactical Resolution Rule 2: Forced Urgent Defense
        # If opponent can win on their next move, we MUST block!
        opponent = 3 - current_player
        threat_blocks = []
        for r, c in cand_moves:
            game.place(r, c, opponent)
            opp_wins = game.check_win(r, c)
            game.unplace(r, c, opponent)
            if opp_wins:
                threat_blocks.append(r * 15 + c)

        # Initial root expansion
        priors, _ = self._evaluate_state(game, current_player)
        if not priors:
            return root

        # If urgent blocks exist, restrict root expansion strictly to the blocking moves
        if threat_blocks:
            filtered_priors = {}
            for act in threat_blocks:
                filtered_priors[act] = priors.get(act, 1.0 / len(threat_blocks))
            # Renormalize
            sum_fp = sum(filtered_priors.values())
            for act in filtered_priors:
                filtered_priors[act] /= sum_fp
            priors = filtered_priors

        # Optional Dirichlet noise injection for self-play exploration
        if add_dirichlet_noise and len(priors) > 0:
            acts = list(priors.keys())
            noise = np.random.dirichlet([self.dirichlet_alpha] * len(acts))
            for i, act in enumerate(acts):
                priors[act] = (1.0 - self.dirichlet_eps) * priors[act] + self.dirichlet_eps * float(noise[i])

        root.expand(priors)

        # Run MCTS simulations
        for _ in range(self.num_simulations):
            node = root
            sim_player = current_player
            search_path = []

            # 1. Selection
            while node.is_expanded and node.children:
                child = node.select_child(self.c_puct)
                if child is None:
                    break
                node = child
                r, c = node.action // 15, node.action % 15
                game.place(r, c, sim_player)
                search_path.append((node, r, c, sim_player))
                sim_player = 3 - sim_player

            # 2. Check terminal state along path
            last_act = search_path[-1] if search_path else None
            is_terminal = False
            value = 0.0

            if last_act is not None:
                _, lr, lc, l_player = last_act
                if game.check_win(lr, lc):
                    # l_player won! To the current sim_player whose turn it is now, this is a loss (-1.0).
                    is_terminal = True
                    value = -1.0
                elif game.occupied_count == TOTAL_CELLS:
                    is_terminal = True
                    value = 0.0

            # 3. Expansion & Evaluation (if not terminal)
            if not is_terminal:
                leaf_priors, leaf_value = self._evaluate_state(game, sim_player)
                if leaf_priors:
                    node.expand(leaf_priors)
                value = leaf_value

            # 4. Backup
            node.backup(value)

            # Revert game board along the search path (in-place unplace)
            for _, r, c, p in reversed(search_path):
                game.unplace(r, c, p)

        return root

    def get_action_probabilities(self, root, temperature=1.0):
        """
        Converts root visit counts into a probability distribution over 225 actions:
        pi(a) proportional to N(s, a)^(1/tau)
        """
        pi = np.zeros(TOTAL_CELLS, dtype=np.float32)
        if not root.children:
            return pi

        actions = list(root.children.keys())
        visits = np.array([root.children[a].visit_count for a in actions], dtype=np.float32)

        if temperature <= 1e-4:
            # Deterministic argmax
            best_idx = np.argmax(visits)
            pi[actions[best_idx]] = 1.0
            return pi

        # Softmax with temperature
        visits_temp = visits ** (1.0 / temperature)
        sum_visits = np.sum(visits_temp)

        if sum_visits > 0:
            probs = visits_temp / sum_visits
            for act, p in zip(actions, probs):
                pi[act] = p
        else:
            for act in actions:
                pi[act] = 1.0 / len(actions)

        return pi

    def get_best_move(self, game, current_player, temperature=0.0):
        """
        Helper to run search and return best move (r, c) along with telemetry.
        """
        root = self.search(game, current_player, add_dirichlet_noise=False)
        pi = self.get_action_probabilities(root, temperature=temperature)
        best_act = int(np.argmax(pi))
        best_r, best_c = best_act // 15, best_act % 15

        # Extract top 3 candidates for diagnostics
        sorted_acts = sorted(root.children.keys(), key=lambda a: root.children[a].visit_count, reverse=True)
        top_candidates = []
        for act in sorted_acts[:3]:
            ch = root.children[act]
            top_candidates.append({
                "move": (act // 15, act % 15),
                "visits": ch.visit_count,
                "q_value": ch.q_value,
                "prior": ch.prior
            })

        return (best_r, best_c), top_candidates, root.q_value
