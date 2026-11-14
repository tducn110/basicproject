# Local Caro defense demonstration

The local source package includes the current six-profile application and its
Rust source. The presentation and game run as two local services.

From `CaroGame`, install the locked JavaScript dependencies with `npm ci`.
The generated WASM package is included, so `npm run dev` starts the game at
<http://localhost:8443> without a Rust installation.

To rebuild WASM, install Rust, the `wasm32-unknown-unknown` target and wasm-pack,
then run `npm run build:wasm` from `CaroGame`. This build uses `--locked --offline`,
so the locked Cargo dependencies must already be available in the local cache.
`engine/README.md` describes the native and WASM commands.

In a second terminal, run `npm ci` followed by `npm run dev` from `present`.
Open <http://localhost:5174>. Its embedded board and playable links select the
game on port 8443 when running locally. `VITE_CARO_GAME_URL` can override the
endpoint before starting Vite.

| Profile | Policy | Depth | Numeric ID | Soft cap |
| --- | --- | ---: | ---: | ---: |
| Easy | Random | 0 | 0 | none |
| Normal | RuleBased | 1 | 1 | none |
| Hard | Alpha-Beta | 2 | 2 | 15 |
| Very Hard | Alpha-Beta | 3 | 5 | 12 |
| Expert | Alpha-Beta | 4 | 3 | 10 |
| Master | Alpha-Beta | 5 | 4 | 8 |

These are the report's configured policies. An immediate tactical shortcut can
finish before a Worker search, and a terminal board can return no move. Neither
case implies a missing profile. Increasing depth while reducing the candidate
cap does not establish a calibrated ranking of playing strength.

Verification on 13 November 2026: native Rust 38 unit + 7 integration tests;
frontend 65 tests across 9 files; TypeScript and Vite builds; all six profiles
selected in a local browser, with completed depths 0/1/2/3/4/5 on the checked
opening. The fresh 111,582-byte WASM package matches the previous canonical
binary, SHA-256 `1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989`.
The generated provenance manifest identifies inputs, outputs and tool versions.

The public `10-caro.vercel.app` deployment was not updated. Use the local URLs
above for this release. No commit, push or deployment is part of this handoff.
