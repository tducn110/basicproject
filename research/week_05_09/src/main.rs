//! Reproducible, native-only experiments against the existing reference library.
//! No browser, Wasm, remote repository, or production implementation is exercised.
use caro_core_reference::bot::random::SplitMix64;
use caro_core_reference::search::alpha_beta::search_alpha_beta;
use caro_core_reference::search::iterative::iterative_deepening;
use caro_core_reference::search::minimax::search_minimax;
use caro_core_reference::search::optimized::search_optimized_alpha_beta;
use caro_core_reference::search::transposition::{Bound, TTEntry, TranspositionTable};
use caro_core_reference::search::{MoveMode, SearchConfig};
use caro_core_reference::zobrist::Zobrist;
use caro_core_reference::{generate_candidates, CandidateConfig, EvalWeights, GameState, GameStatus, Move, Player, RuleConfig, SearchResult};
use std::collections::HashSet;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use std::time::Instant;

const HASH_SEED: u64 = 20261017;
const RANDOM_SEED: u64 = 5006070809;

#[derive(Default)]
struct Checks {
    search_runs: usize,
    root_restorations: usize,
    mm_ab_pairs: usize,
    ordering_pairs: usize,
    tt_pairs: usize,
    hash_forward: usize,
    hash_reverse: usize,
    hash_terminal: usize,
    candidate_sets: usize,
    bound_exact: usize,
    bound_lower: usize,
    bound_upper: usize,
    fixture_positions: usize,
}

fn mv(row: usize, col: usize) -> Move { Move::new(row, col).unwrap() }

fn fixture(name: &str) -> GameState {
    let mut s = GameState::new(RuleConfig::freestyle());
    match name {
        "empty" => {}
        "center" => { s.set_cell_for_fixture(7, 7, Player::X).unwrap(); s.set_to_move_for_fixture(Player::O); }
        "corner" => { s.set_cell_for_fixture(0, 0, Player::X).unwrap(); s.set_to_move_for_fixture(Player::O); }
        "clustered" => {
            for (r,c,p) in [(7,7,Player::X),(7,8,Player::O),(8,7,Player::X),(8,8,Player::O)] {
                s.set_cell_for_fixture(r,c,p).unwrap();
            }
        }
        "separated" => { s.set_cell_for_fixture(2,2,Player::X).unwrap(); s.set_cell_for_fixture(12,12,Player::O).unwrap(); }
        "win" | "block" => {
            let attack = if name == "win" { Player::X } else { Player::O };
            for c in 3..=6 { s.set_cell_for_fixture(7,c,attack).unwrap(); }
            s.set_cell_for_fixture(5,5,attack.opponent()).unwrap();
            s.set_cell_for_fixture(5,6,attack.opponent()).unwrap();
            s.set_to_move_for_fixture(Player::X);
        }
        _ => panic!("Unknown fixture {name}"),
    }
    s
}

fn config(depth: u8, radius: Option<u8>, cap: Option<usize>, ordered: bool) -> SearchConfig {
    SearchConfig {
        depth,
        move_mode: radius.map(|r| MoveMode::Candidates(CandidateConfig {radius:r,max_candidates:cap})).unwrap_or(MoveMode::AllLegal),
        use_move_ordering: ordered,
        weights: EvalWeights::default(),
    }
}

fn run_search(name: &str, s: &GameState, cfg: SearchConfig, checks: &mut Checks) -> (SearchResult,u128,usize) {
    let mut state = s.clone();
    let before = format!("{state:?}");
    let mut tt = TranspositionTable::with_capacity(16384);
    let z = Zobrist::new(HASH_SEED);
    let start = Instant::now();
    let result = match name {
        "minimax" => search_minimax(&mut state,cfg),
        "alpha_beta" => search_alpha_beta(&mut state,cfg),
        "optimized_cold" => search_optimized_alpha_beta(&mut state,cfg,&z,&mut tt,None).unwrap(),
        _ => panic!("Unknown algorithm {name}"),
    };
    let micros = start.elapsed().as_micros();
    assert_eq!(format!("{state:?}"),before,"{name} failed to restore root");
    assert!(result.best_move.map(|m| s.is_empty(m)).unwrap_or(true));
    checks.search_runs += 1;
    checks.root_restorations += 1;
    (result,micros,tt.len())
}

fn write_run(out: &mut File, fixture_name: &str, alg: &str, cfg: SearchConfig, repeat: usize, r: SearchResult, us: u128, entries: usize) {
    let (mode,radius,cap) = match cfg.move_mode {
        MoveMode::AllLegal => ("all_legal".to_string(),String::new(),String::new()),
        MoveMode::Candidates(c) => ("candidates".into(),c.radius.to_string(),c.max_candidates.map(|x|x.to_string()).unwrap_or_default()),
    };
    let (row,col) = r.best_move.map(|m|(m.row().to_string(),m.col().to_string())).unwrap_or_default();
    let st=r.stats;
    writeln!(out,"{fixture_name},{alg},{mode},{radius},{cap},{},{},{repeat},{},{row},{col},{},{},{},{},{},{},{},{},{entries},{us}",cfg.use_move_ordering,cfg.depth,r.score,st.nodes_visited,st.leaf_evaluations,st.cutoffs,st.skipped_siblings,st.candidate_moves_generated,st.ordering_evaluations,st.tt_lookups,st.tt_hits).unwrap();
}

fn candidate_checks(dir: &Path, checks: &mut Checks) {
    let mut out=File::create(dir.join("candidates.csv")).unwrap();
    writeln!(out,"fixture,occupied,legal,radius,cap,candidates,legal_unique,in_radius,winning_endpoints_present").unwrap();
    for name in ["empty","center","corner","clustered","separated","win"] {
        let s=fixture(name);
        for radius in 0..=3 {
            for cap in [None,Some(6)] {
                let moves=generate_candidates(&s,CandidateConfig{radius,max_candidates:cap});
                let unique: HashSet<_>=moves.iter().copied().collect();
                assert_eq!(unique.len(),moves.len());
                assert!(moves.iter().all(|&m| s.is_empty(m)));
                let near=moves.iter().all(|m| s.move_count()==0 || s.board().iter().enumerate().any(|(i,&v)| v!=0 && (m.row().abs_diff(i/15).max(m.col().abs_diff(i%15))<=radius as usize)));
                assert!(near);
                let endpoints=[mv(7,2),mv(7,7)].iter().filter(|m| moves.contains(m)).count();
                writeln!(out,"{name},{},{},{radius},{},{},true,{near},{}",s.move_count(),s.legal_moves().len(),cap.map(|n|n.to_string()).unwrap_or_default(),moves.len(),if name=="win"{endpoints.to_string()}else{String::new()}).unwrap();
                checks.candidate_sets+=1;
            }
        }
    }
    let tactical=fixture("win");
    let full=generate_candidates(&tactical,CandidateConfig{radius:1,max_candidates:None});
    let capped=generate_candidates(&tactical,CandidateConfig{radius:1,max_candidates:Some(6)});
    assert!(full.contains(&mv(7,2)) && full.contains(&mv(7,7)));
    assert!(!capped.contains(&mv(7,2)) && !capped.contains(&mv(7,7)));
    let (uncapped,_,_)=run_search("alpha_beta",&tactical,config(1,Some(1),None,false),checks);
    let (capped_result,_,_)=run_search("alpha_beta",&tactical,config(1,Some(1),Some(6),false),checks);
    assert_eq!(uncapped.score,9_999_999);
    assert_ne!(capped_result.score,uncapped.score);
    fs::write(dir.join("cap_loss.json"),format!("{{\n  \"fixture\": \"win\",\n  \"radius\": 1,\n  \"cap\": 6,\n  \"uncapped_candidates\": {},\n  \"capped_candidates\": {},\n  \"uncapped_score_depth_1\": {},\n  \"capped_score_depth_1\": {},\n  \"omitted_winning_moves_zero_based\": [[7,2],[7,7]]\n}}\n",full.len(),capped.len(),uncapped.score,capped_result.score)).unwrap();
}

fn hashes(checks: &mut Checks) {
    let z=Zobrist::new(HASH_SEED);
    let mut rng=SplitMix64::new(RANDOM_SEED);
    for _ in 0..100 {
        let mut s=fixture("empty");
        let mut hash=z.hash(&s);
        let mut history=Vec::new();
        for _ in 0..40 {
            if s.status()!=GameStatus::Playing {break;}
            let legal=s.legal_moves();
            let m=legal[rng.next_u64() as usize % legal.len()];
            let before=hash;
            let mover=s.to_move();
            let token=s.play(m).unwrap();
            let side_changed=mover!=s.to_move();
            hash=z.after_play(hash,m,mover,side_changed);
            assert_eq!(hash,z.hash(&s));
            checks.hash_forward+=1;
            history.push((token,m,mover,side_changed,before));
        }
        while let Some((token,m,mover,side_changed,before))=history.pop() {
            hash=z.after_play(hash,m,mover,side_changed);
            s.undo(token);
            assert_eq!(hash,before);
            assert_eq!(hash,z.hash(&s));
            checks.hash_reverse+=1;
        }
        assert_eq!(s.move_count(),0);
    }
    for (dr,dc) in [(0,1),(1,0),(1,1),(1,-1)] {
        let mut s=fixture("empty");
        for k in 0..4 {s.set_cell_for_fixture((7+dr*k) as usize,(7+dc*k) as usize,Player::X).unwrap();}
        let m=mv((7+dr*4) as usize,(7+dc*4) as usize);
        let before=z.hash(&s);
        let token=s.play(m).unwrap();
        assert_eq!(s.status(),GameStatus::Won(Player::X));
        assert_eq!(s.to_move(),Player::X,"terminal move leaves side unchanged");
        let after=z.after_play(before,m,Player::X,false);
        assert_eq!(after,z.hash(&s));
        assert_ne!(z.after_play(before,m,Player::X,true),z.hash(&s),"unconditional side toggle must be detected");
        s.undo(token);
        assert_eq!(z.after_play(after,m,Player::X,false),z.hash(&s));
        assert_eq!(z.hash(&s),before);
        checks.hash_terminal+=1;
    }
    let mut s=fixture("clustered");
    let x=z.hash(&s);s.set_to_move_for_fixture(Player::O);
    assert_ne!(x,z.hash(&s),"same board different side must not share key in this fixture");
    // The current key omits rules. This is an observed scope limitation, not a passing safety gate.
    assert_eq!(z.hash(&GameState::new(RuleConfig::freestyle())),z.hash(&GameState::new(RuleConfig::exact_five())));
}

fn tt_checks(dir: &Path, checks: &mut Checks) {
    let mut tt=TranspositionTable::default();
    for (i,bound) in [Bound::Exact,Bound::Lower,Bound::Upper].iter().copied().enumerate() {
        let e=TTEntry{depth:3,score:100+i as i32,bound,best_move:Some(mv(7,i))};
        tt.store(i as u64,e); assert_eq!(tt.get(i as u64),Some(e));
        tt.store(i as u64,TTEntry{depth:2,score:-1,..e}); assert_eq!(tt.get(i as u64),Some(e));
        let newer=TTEntry{depth:4,score:200,..e};tt.store(i as u64,newer);assert_eq!(tt.get(i as u64),Some(newer));
        let equal=TTEntry{depth:4,score:300,..e};tt.store(i as u64,equal);assert_eq!(tt.get(i as u64),Some(equal));
    }
    assert_eq!(tt.len(),3);tt.clear();assert_eq!(tt.len(),0);
    // Inspect actual bound variants stored by a bounded depth-4 search.
    let z=Zobrist::new(HASH_SEED);
    let mut s=fixture("clustered");
    let cfg=config(4,Some(1),Some(8),false);
    let before=format!("{s:?}");
    let result=search_optimized_alpha_beta(&mut s,cfg,&z,&mut tt,None).unwrap();
    assert_eq!(before,format!("{s:?}"));checks.root_restorations+=1;
    let mut seen=HashSet::new();
    fn inspect(s:&mut GameState,depth:u8,z:&Zobrist,tt:&TranspositionTable,seen:&mut HashSet<u64>,checks:&mut Checks) {
        if !seen.insert(z.hash(s)) {return;}
        if let Some(e)=tt.get(z.hash(s)) { match e.bound {Bound::Exact=>checks.bound_exact+=1,Bound::Lower=>checks.bound_lower+=1,Bound::Upper=>checks.bound_upper+=1} }
        if depth==0 || s.status()!=GameStatus::Playing {return;}
        for m in generate_candidates(s,CandidateConfig{radius:1,max_candidates:Some(8)}) {
            let t=s.play(m).unwrap();inspect(s,depth-1,z,tt,seen,checks);s.undo(t);
        }
    }
    inspect(&mut s,3,&z,&tt,&mut seen,checks);
    assert!(checks.bound_exact>0 && checks.bound_lower>0 && checks.bound_upper>0);
    fs::write(dir.join("tt_semantics.json"),format!("{{\n  \"bound_roundtrip_variants\": 3,\n  \"replacement_cases_per_variant\": 3,\n  \"observed_bound_counts\": {{\"exact\": {}, \"lower\": {}, \"upper\": {}}},\n  \"inspected_unique_hashes\": {},\n  \"stored_entries\": {},\n  \"tt_hits\": {},\n  \"tt_lookups\": {},\n  \"ttentry_size_of_bytes_native\": {},\n  \"hashmap_is_fixed_8mb\": false,\n  \"rules_in_key\": false,\n  \"root_perspective_in_key\": false,\n  \"mate_ply_normalization_present\": false\n}}\n",checks.bound_exact,checks.bound_lower,checks.bound_upper,seen.len(),tt.len(),result.stats.tt_hits,result.stats.tt_lookups,std::mem::size_of::<TTEntry>())).unwrap();
    // Reuse is measured separately. Root-relative scores have no perspective tag.
    let same_root = search_optimized_alpha_beta(&mut s,cfg,&z,&mut tt,None).unwrap();
    assert_eq!(same_root.score,result.score);
    assert_eq!(before,format!("{s:?}"));checks.root_restorations+=1;
    let token=s.play(result.best_move.unwrap()).unwrap();
    let shifted_before=format!("{s:?}");
    let next_cfg=SearchConfig{depth:3,..cfg};
    let mut cold=TranspositionTable::default();
    let next_cold=search_optimized_alpha_beta(&mut s,next_cfg,&z,&mut cold,None).unwrap();
    let next_warm=search_optimized_alpha_beta(&mut s,next_cfg,&z,&mut tt,None).unwrap();
    assert_eq!(shifted_before,format!("{s:?}"));checks.root_restorations+=1;
    s.undo(token);
    fs::write(dir.join("cache_scope_probe.json"),format!("{{\n  \"fixture\": \"clustered\",\n  \"radius\": 1,\n  \"cap\": 8,\n  \"initial_depth\": 4,\n  \"same_root_score\": {},\n  \"same_root_warm_score\": {},\n  \"same_root_warm_nodes\": {},\n  \"same_root_warm_hits\": {},\n  \"after_move_depth\": 3,\n  \"after_move_cold_score\": {},\n  \"after_move_warm_score\": {},\n  \"after_move_scores_equal\": {},\n  \"interpretation\": \"Probe only. Reusing root-relative entries across a root-player change is unsupported; start with a fresh table or tag the evaluation namespace.\"\n}}\n",result.score,same_root.score,same_root.stats.nodes_visited,same_root.stats.tt_hits,next_cold.score,next_warm.score,next_cold.score==next_warm.score)).unwrap();
    let mut abort_state=fixture("clustered");let before=format!("{abort_state:?}");
    let mut fresh=TranspositionTable::default();
    assert!(search_optimized_alpha_beta(&mut abort_state,cfg,&z,&mut fresh,Some(10)).is_err());
    assert_eq!(before,format!("{abort_state:?}"));checks.root_restorations+=1;
    let iterative=iterative_deepening(&mut abort_state,cfg,4,50,&z);
    assert_eq!(before,format!("{abort_state:?}"));checks.root_restorations+=1;
    assert!(iterative.budget_exhausted);
    fs::write(dir.join("budget_abort.json"),format!("{{\n  \"direct_budget\": 10,\n  \"direct_abort_restores_root\": true,\n  \"iterative_budget\": 50,\n  \"iterative_budget_exhausted\": {},\n  \"last_complete_depth\": {},\n  \"aggregate_reported_nodes\": {},\n  \"aggregate_includes_aborted_iteration\": false,\n  \"iterative_restores_root\": true\n}}\n",iterative.budget_exhausted,iterative.last_complete.map(|r|r.stats.completed_depth).unwrap_or(0),iterative.aggregate_stats.nodes_visited)).unwrap();
}

fn experiments(dir: &Path, checks: &mut Checks) {
    let mut out=File::create(dir.join("search_runs.csv")).unwrap();
    writeln!(out,"fixture,algorithm,move_mode,radius,cap,ordering,depth,repeat,score,best_row,best_col,nodes,leaf_evaluations,cutoffs,skipped_siblings,candidates_generated,ordering_evaluations,tt_lookups,tt_hits,tt_entries,elapsed_us").unwrap();
    for name in ["center","clustered","win","block"] {
        let s=fixture(name);checks.fixture_positions+=1;
        let mut configs=vec![];
        for d in 1..=2 {configs.push(config(d,None,None,false));configs.push(config(d,Some(1),None,false));}
        for d in 1..=3 {configs.push(config(d,Some(1),Some(12),false));}
        configs.push(config(4,Some(1),Some(8),false));
        for cfg in configs {
            for repeat in 1..=3 {
                let (mm,us,n)=run_search("minimax",&s,cfg,checks);write_run(&mut out,name,"minimax",cfg,repeat,mm,us,n);
                let (ab,us,n)=run_search("alpha_beta",&s,cfg,checks);write_run(&mut out,name,"alpha_beta",cfg,repeat,ab,us,n);
                assert_eq!((mm.score,mm.best_move),(ab.score,ab.best_move),"MM/AB mismatch {name} {cfg:?}");checks.mm_ab_pairs+=1;
                assert!(ab.stats.nodes_visited<=mm.stats.nodes_visited);
                let ordered_cfg=SearchConfig{use_move_ordering:true,..cfg};
                let (ordered,us,n)=run_search("alpha_beta",&s,ordered_cfg,checks);write_run(&mut out,name,"alpha_beta",ordered_cfg,repeat,ordered,us,n);
                assert_eq!(ab.score,ordered.score,"Ordering changed score {name} {cfg:?}");checks.ordering_pairs+=1;
                for (comparison,tt_cfg) in [(ab,cfg),(ordered,ordered_cfg)] {
                    let (optimized,us,n)=run_search("optimized_cold",&s,tt_cfg,checks);write_run(&mut out,name,"optimized_cold",tt_cfg,repeat,optimized,us,n);
                    assert_eq!(comparison.score,optimized.score,"Cold TT changed score {name} {tt_cfg:?}");checks.tt_pairs+=1;
                }
            }
        }
    }
    // Additional reproducible reachable positions, unlike the deliberately synthetic tactical fixtures.
    let mut rng=SplitMix64::new(RANDOM_SEED);
    for i in 0..16 {
        let mut s=fixture("empty");
        for _ in 0..(6+i%9) {
            let options=generate_candidates(&s,CandidateConfig{radius:1,max_candidates:None});
            s.play(options[rng.next_u64() as usize%options.len()]).unwrap();
            if s.status()!=GameStatus::Playing {break;}
        }
        checks.fixture_positions+=1;
        let name=format!("seeded_{i:02}");
        let cfg=config(3,Some(1),Some(8),false);
        let (mm,us,n)=run_search("minimax",&s,cfg,checks);write_run(&mut out,&name,"minimax",cfg,1,mm,us,n);
        let (ab,us,n)=run_search("alpha_beta",&s,cfg,checks);write_run(&mut out,&name,"alpha_beta",cfg,1,ab,us,n);
        assert_eq!((mm.score,mm.best_move),(ab.score,ab.best_move));checks.mm_ab_pairs+=1;
        let ordered_cfg=SearchConfig{use_move_ordering:true,..cfg};
        let (ordered,us,n)=run_search("alpha_beta",&s,ordered_cfg,checks);write_run(&mut out,&name,"alpha_beta",ordered_cfg,1,ordered,us,n);
        assert_eq!(ordered.score,ab.score);checks.ordering_pairs+=1;
        let (optimized,us,n)=run_search("optimized_cold",&s,ordered_cfg,checks);write_run(&mut out,&name,"optimized_cold",ordered_cfg,1,optimized,us,n);
        assert_eq!(optimized.score,ordered.score);checks.tt_pairs+=1;
    }
}

fn main() {
    let path=std::env::args().nth(1).unwrap_or_else(||"results".into());let dir=Path::new(&path);fs::create_dir_all(dir).unwrap();
    let mut checks=Checks::default();
    println!("Native reference experiments; HASH_SEED={HASH_SEED}; RANDOM_SEED={RANDOM_SEED}");
    candidate_checks(dir,&mut checks);println!("Candidate geometry and tactical cap-loss checks passed");
    hashes(&mut checks);println!("Incremental hash forward/undo/terminal checks passed");
    tt_checks(dir,&mut checks);println!("TT bound storage replacement and root restoration checks passed");
    experiments(dir,&mut checks);println!("Search measurements and differential assertions passed");
    fs::write(dir.join("verification.json"),format!("{{\n  \"status\": \"passed\",\n  \"hash_seed\": {HASH_SEED},\n  \"random_seed\": {RANDOM_SEED},\n  \"search_runs\": {},\n  \"root_restorations\": {},\n  \"minimax_alpha_beta_pairs\": {},\n  \"ordering_score_pairs\": {},\n  \"cold_tt_score_pairs\": {},\n  \"random_hash_forward_checks\": {},\n  \"random_hash_undo_checks\": {},\n  \"terminal_hash_axis_checks\": {},\n  \"candidate_sets\": {},\n  \"search_fixture_positions\": {},\n  \"timing_repeats_controlled_fixtures\": 3,\n  \"browser_or_wasm_exercised\": false\n}}\n",checks.search_runs,checks.root_restorations,checks.mm_ab_pairs,checks.ordering_pairs,checks.tt_pairs,checks.hash_forward,checks.hash_reverse,checks.hash_terminal,checks.candidate_sets,checks.fixture_positions)).unwrap();
    println!("PASS: {} measured/search assertion runs, {} root restoration checks; outputs {}",checks.search_runs,checks.root_restorations,dir.display());
}
