//! Native release evidence for the current engine, not the research reference
//! core or a browser benchmark. Run with an output directory as the first arg.
use gomoku_engine::ai::{choose_move, Difficulty};
use gomoku_engine::board::{Board, Cell, SIZE};
use gomoku_engine::candidates::{select_candidates, winning_completion, CandidatePolicy};
use gomoku_engine::search::{search_in_place, SearchAlgorithm, SearchConfig, SearchResult};
use std::collections::HashSet;
use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use std::time::Instant;

#[derive(Default)]
struct Checks {
    runs: usize, restores: usize, mm_ab_pairs: usize, ordering_pairs: usize,
    repeated_results: usize, geometry: usize, tactical_recall: usize,
    terminal: usize, address_offsets: usize,
}

fn fixture(name: &str) -> Board {
    let mut b = Board::new();
    match name {
        "empty" => {},
        "center" => { b.place(7, 7, Cell::Black).unwrap(); },
        "corner" => { b.place(0, 0, Cell::Black).unwrap(); },
        "clustered" => {
            for (x, y, p) in [(7,7,Cell::Black),(8,7,Cell::White),(7,8,Cell::Black),(8,8,Cell::White)] {
                b.place(x, y, p).unwrap();
            }
        },
        "separated" => { b.place(2,2,Cell::Black).unwrap(); b.place(12,12,Cell::White).unwrap(); },
        "win_gap" | "block_gap" => {
            let attack = if name == "win_gap" { Cell::Black } else { Cell::White };
            for x in [3,4,6,7] { b.place(x, 7, attack).unwrap(); }
            b.place(5,4,attack.opponent()).unwrap();
        },
        "full_draw" => {
            for y in 0..SIZE { for x in 0..SIZE {
                b.place(x,y,if (x+2*y)%4<2 {Cell::Black} else {Cell::White}).unwrap();
            }}
        },
        _ => panic!("unknown fixture {name}"),
    }
    b
}

fn record_search(
    out: &mut File, name: &str, original: &Board, config: SearchConfig,
    repeat: usize, checks: &mut Checks,
) -> SearchResult {
    let mut owned = original.clone(); // excluded from the timed region
    let start = Instant::now();
    let result = search_in_place(&mut owned, Cell::Black, config);
    let nanos = start.elapsed().as_nanos();
    assert_eq!(&owned, original, "root restoration failed for {name}");
    assert!(result.best_move.is_none_or(|(x,y)| original.get_checked(x,y)==Some(Cell::Empty)));
    checks.runs += 1; checks.restores += 1;
    let (x,y) = result.best_move.map(|(x,y)|(x.to_string(),y.to_string())).unwrap_or_default();
    let cap = config.candidates.max_candidates.map(|v|v.to_string()).unwrap_or_default();
    let alg = if config.algorithm == SearchAlgorithm::Minimax {"minimax"} else {"alpha_beta"};
    let s = result.stats;
    writeln!(out,"{name},{alg},{},{},{},{cap},{repeat},{x},{y},{},{},{},{},{},{},{},{nanos},true",
        config.candidates.move_ordering,config.depth,config.candidates.radius,result.score,
        s.nodes_visited,s.leaf_evaluations,s.cutoffs,s.ordering_evaluations,
        s.candidate_moves_generated,s.completed_depth).unwrap();
    result
}

fn matrix(out: &mut File, name: &str, board: &Board, depth: usize, cap: Option<usize>, radius: usize, checks: &mut Checks) {
    let mut first: Vec<SearchResult> = Vec::new();
    for repeat in 0..3 {
        let mut current = Vec::new();
        for ordered in [false,true] {
            for algorithm in [SearchAlgorithm::Minimax,SearchAlgorithm::AlphaBeta] {
                let config = SearchConfig {depth,algorithm,candidates:CandidatePolicy{radius,max_candidates:cap,move_ordering:ordered}};
                current.push(record_search(out,name,board,config,repeat,checks));
            }
        }
        for pair in [(0,1),(2,3)] {
            assert_eq!((current[pair.0].score,current[pair.0].best_move),(current[pair.1].score,current[pair.1].best_move));
            assert_eq!(current[pair.0].stats.cutoffs,0);
            checks.mm_ab_pairs += 1;
        }
        for pair in [(0,2),(1,3)] { assert_eq!(current[pair.0].score,current[pair.1].score); checks.ordering_pairs+=1; }
        if repeat == 0 { first=current; }
        else { for (a,b) in first.iter().zip(current.iter()) {
            assert_eq!((a.score,a.best_move,a.stats),(b.score,b.best_move,b.stats)); checks.repeated_results+=1;
        }}
    }
}

fn main() {
    let output = std::env::args().nth(1).expect("provide an output directory");
    let dir=Path::new(&output); fs::create_dir_all(dir).unwrap();
    let mut checks=Checks::default();
    let mut out=File::create(dir.join("engine_search_runs.csv")).unwrap();
    writeln!(out,"fixture,algorithm,ordered,requested_depth,radius,soft_cap,repeat,best_x,best_y,score,nodes,leaves,cutoffs,rank_evaluations,candidates_before_cap,completed_depth,elapsed_ns,root_restored").unwrap();
    for name in ["center","clustered","win_gap","block_gap"] {
        let board=fixture(name);
        for depth in 1..=3 {matrix(&mut out,name,&board,depth,Some(8),2,&mut checks);}
        for depth in 1..=2 {matrix(&mut out,name,&board,depth,None,1,&mut checks);}
    }
    let mut seed=20261023u64;
    for position in 0..16 {
        let mut board=Board::new();
        for ply in 0..8 {
            seed=seed.wrapping_mul(6364136223846793005).wrapping_add(1);
            let legal=board.legal_moves(); let (x,y)=legal[(seed%legal.len() as u64)as usize];
            board.place(x,y,if ply%2==0{Cell::Black}else{Cell::White}).unwrap();
        }
        assert_eq!(board.check_winner(),None);
        for depth in 1..=3 {matrix(&mut out,&format!("seeded_{position:02}"),&board,depth,Some(8),2,&mut checks);}
    }
    let mut geometry=File::create(dir.join("engine_candidates.csv")).unwrap();
    writeln!(geometry,"fixture,occupied,legal,radius,soft_cap,neighborhood_candidates,assessed_candidates,selected,tactical_retained,tactical_completions,all_tactical_retained").unwrap();
    for name in ["empty","center","corner","clustered","separated","win_gap","full_draw"] {
        let board=fixture(name);
        for radius in 0..=3 {for cap in [None,Some(1),Some(8)] {
            let policy=CandidatePolicy{radius,max_candidates:cap,move_ordering:true};
            let selected=select_candidates(&board,Cell::Black,policy);
            let unique:HashSet<_>=selected.moves.iter().copied().collect();
            assert_eq!(unique.len(),selected.moves.len());
            assert!(selected.moves.iter().all(|&(x,y)|board.get_checked(x,y)==Some(Cell::Empty)));
            let tactical:Vec<_>=board.legal_moves().into_iter().filter(|&mv|
                winning_completion(&board,mv,Cell::Black)||winning_completion(&board,mv,Cell::White)).collect();
            assert!(tactical.iter().all(|mv|selected.moves.contains(mv)));
            checks.geometry+=1; checks.tactical_recall+=tactical.len();
            writeln!(geometry,"{name},{},{},{radius},{},{},{},{},{},{},true",board.move_count(),board.legal_moves().len(),cap.map(|v|v.to_string()).unwrap_or_default(),board.get_candidates(radius).len(),selected.generated,selected.moves.len(),selected.tactical_retained,tactical.len()).unwrap();
        }}
    }
    let board=Board::new(); let cells=board.cells();
    let base=&cells[0][0] as *const Cell as usize;
    let mut addresses=File::create(dir.join("engine_address_offsets.csv")).unwrap();
    writeln!(addresses,"x,y,flattened_index,actual_offset_bytes,expected_offset_bytes").unwrap();
    for (y,row) in cells.iter().enumerate() {for (x,cell) in row.iter().enumerate() {
        let index=y*SIZE+x; let offset=cell as *const Cell as usize-base;
        assert_eq!(offset,index*std::mem::size_of::<Cell>()); checks.address_offsets+=1;
        writeln!(addresses,"{x},{y},{index},{offset},{}",index*std::mem::size_of::<Cell>()).unwrap();
    }}
    fs::write(dir.join("engine_native_layout.json"),format!("{{\n  \"cell_bytes\": {},\n  \"board_bytes\": {},\n  \"usize_bytes\": {},\n  \"coordinate_tuple_bytes\": {},\n  \"address_offset_checks\": {},\n  \"target\": \"{}-{}\",\n  \"wasm_layout_measured\": false\n}}\n",std::mem::size_of::<Cell>(),std::mem::size_of::<Board>(),std::mem::size_of::<usize>(),std::mem::size_of::<(usize,usize)>(),checks.address_offsets,std::env::consts::ARCH,std::env::consts::OS)).unwrap();
    let mut difficulties=File::create(dir.join("engine_difficulty_runs.csv")).unwrap();
    writeln!(difficulties,"fixture,id,difficulty,strategy,configured_depth,soft_cap,seed,best_x,best_y,score,nodes,leaves,cutoffs,rank_evaluations,candidates_before_cap,completed_depth,elapsed_ns").unwrap();
    for name in ["center","clustered","block_gap"] {for id in [0,1,2,5,3,4] {
        let board=fixture(name); let before=board.clone(); let level=Difficulty::from_id(id);
        let start=Instant::now(); let decision=choose_move(&board,Cell::Black,level,42); let nanos=start.elapsed().as_nanos();
        assert_eq!(board,before); let result=decision.result; let s=result.stats;
        let (x,y)=result.best_move.map(|(x,y)|(x.to_string(),y.to_string())).unwrap_or_default();
        writeln!(difficulties,"{name},{id},{},{},{},{},42,{x},{y},{},{},{},{},{},{},{},{nanos}",level.label(),decision.strategy,level.depth(),level.max_candidates().map(|v|v.to_string()).unwrap_or_default(),result.score,s.nodes_visited,s.leaf_evaluations,s.cutoffs,s.ordering_evaluations,s.candidate_moves_generated,s.completed_depth).unwrap();
    }}
    let mut won=Board::new(); for x in 0..5 {won.place(x,0,Cell::Black).unwrap();}
    for original in [won,fixture("full_draw")] {for algorithm in [SearchAlgorithm::Minimax,SearchAlgorithm::AlphaBeta] {
        let mut board=original.clone(); let result=search_in_place(&mut board,Cell::White,SearchConfig{algorithm,..SearchConfig::default()});
        assert_eq!(result.best_move,None); assert_eq!(board,original); checks.terminal+=1; checks.restores+=1;
    }}
    let summary=format!("{{\n  \"status\": \"passed\",\n  \"native_only\": true,\n  \"browser_or_wasm_exercised\": false,\n  \"controlled_fixtures\": 4,\n  \"seeded_positions\": 16,\n  \"timing_repeats\": 3,\n  \"search_csv_rows\": {},\n  \"root_restoration_checks\": {},\n  \"minimax_alpha_beta_pairs\": {},\n  \"ordering_value_pairs\": {},\n  \"repeated_decision_counter_checks\": {},\n  \"candidate_configurations\": {},\n  \"tactical_completion_retention_checks\": {},\n  \"terminal_checks\": {},\n  \"native_address_offset_checks\": {},\n  \"difficulty_rows\": 18,\n  \"search_timer_excludes_root_clone\": true,\n  \"timing_order_randomized\": false,\n  \"cpu_pinning\": false\n}}\n",checks.runs,checks.restores,checks.mm_ab_pairs,checks.ordering_pairs,checks.repeated_results,checks.geometry,checks.tactical_recall,checks.terminal,checks.address_offsets);
    fs::write(dir.join("engine_verification.json"),&summary).unwrap(); println!("{summary}");
}
