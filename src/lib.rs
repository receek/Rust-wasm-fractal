mod utils;

use wasm_bindgen::prelude::*;

extern crate web_sys;
use web_sys::console;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

pub struct Timer<'a> {
	name: &'a str,
}

impl<'a> Timer<'a> {
	pub fn new(name: &'a str) -> Timer<'a> {
		console::time_with_label(name);
		Timer { name }
	}
}

impl<'a> Drop for Timer<'a> {
	fn drop(&mut self) {
		console::time_end_with_label(self.name);
	}
}

#[wasm_bindgen]
pub struct Fractal {
	width: u32,
	height: u32,
	cells: Vec<f64>,	
}

#[wasm_bindgen]
impl Fractal {
	fn get_index(&self, row: u32, column: u32) -> usize {
		(row * self.width + column) as usize
	}
	
	pub fn new(width: u32, height: u32) -> Fractal {
		let cells = vec![0.0; (width * height) as usize];

		Fractal {
			width,
			height,
			cells,
		}
	}

	fn belongs_to_frac(x: f64, y: f64, iterations: usize) -> f64 {
		let mut real: f64 = x;
		let mut imag: f64 = y;

		for i in 0..iterations {
			let temp_real = real * real - imag * imag + x;
			let temp_imag = 2.0 * real * imag + y;

			real = temp_real;
			imag = temp_imag;

			if real * imag > 5.0 {
				return i as f64 / iterations as f64;
			}
		}

		0.0
	}

	pub fn calculate_frac(&mut self, magnif: f64, pan_x: f64, pan_y: f64, iterations: u32) {
		let _timer = Timer::new("Rendering time in Rust");

		for x in 0..self.height {
			for y in 0..self.width {
				let belongs = Fractal::belongs_to_frac(x as f64 / magnif - pan_x, y as f64 / magnif - pan_y, iterations as usize);
				if belongs > 0.0 {
					let idx = self.get_index(y, x);
					self.cells[idx] = belongs;
				}
			}
		}
	}

	pub fn render(&self) -> Vec<u8> {

		let mut res :Vec<u8> = vec![];
		for l in self.cells.clone() {
			let c: f64 = (1.0 - (2.0 * l - 1.0).abs()) * 1.0;
			let x: f64 = 0.0;
			let m: f64 = l - c / 2.0;
			
			res.push(((c + m) * 255.0) as u8);
			res.push(((x + m) * 255.0) as u8);
			res.push((m * 255.0) as u8);
			res.push(255);
		}

		res
	}

}