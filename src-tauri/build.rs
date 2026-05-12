use std::{env, fs, io::BufReader, path::Path};

fn main() {
    tauri_build::build();

    // Decode the tray icon at build time and write raw RGBA bytes to OUT_DIR.
    // Using include_bytes! on this output file makes rustc track the PNG as a
    // proper compile-time dependency, so any icon change triggers a recompile
    // automatically — something include_image! does not guarantee.
    let icon_path = Path::new("icons/32x32.png");
    println!("cargo:rerun-if-changed={}", icon_path.display());

    let file = fs::File::open(icon_path).expect("cannot open icons/32x32.png");
    let decoder = png::Decoder::new(BufReader::new(file));
    let mut reader = decoder.read_info().expect("cannot read PNG info");

    let mut buf = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).expect("cannot decode PNG frame");

    let rgba: Vec<u8> = match info.color_type {
        png::ColorType::Rgba => buf[..info.buffer_size()].to_vec(),
        png::ColorType::Rgb => buf[..info.buffer_size()]
            .chunks_exact(3)
            .flat_map(|p| [p[0], p[1], p[2], 255])
            .collect(),
        other => panic!("unsupported PNG colour type: {other:?}"),
    };

    // Layout: [width: u32 LE][height: u32 LE][RGBA bytes…]
    let mut out = Vec::with_capacity(8 + rgba.len());
    out.extend_from_slice(&info.width.to_le_bytes());
    out.extend_from_slice(&info.height.to_le_bytes());
    out.extend_from_slice(&rgba);

    let out_path = Path::new(&env::var("OUT_DIR").unwrap()).join("tray_icon.bin");
    fs::write(&out_path, &out).expect("cannot write tray_icon.bin");
}
