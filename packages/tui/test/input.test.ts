import { describe, expect, it } from "bun:test";
import { Input } from "@oh-my-pi/pi-tui/components/input";

describe("Input component", () => {
	const wordLeft = "\x1bb"; // ESC-b (alt+b)
	const wordRight = "\x1bf"; // ESC-f (alt+f)

	function setupAtEnd(text: string): Input {
		const input = new Input();
		input.focused = true;
		input.setValue(text);
		input.handleInput("\x05"); // Ctrl+E (end)
		return input;
	}

	it("moves by CJK and punctuation blocks (backward)", () => {
		const text = "天气不错，去散步吧！";

		{
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("天气不错，去散步吧|！");
		}

		{
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("天气不错，|去散步吧！");
		}

		{
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("天气不错|，去散步吧！");
		}

		{
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("|天气不错，去散步吧！");
		}
	});

	it("moves by CJK and punctuation blocks (forward)", () => {
		const text = "天气不错，去散步吧！";
		const input = new Input();
		input.focused = true;
		input.setValue(text);
		input.handleInput("\x01"); // Ctrl+A (start)

		input.handleInput(wordRight);
		input.handleInput("|");
		expect(input.getValue()).toBe("天气不错|，去散步吧！");
	});

	it("treats NBSP as whitespace for word navigation", () => {
		const nbsp = "\u00A0";
		const text = `Hola${nbsp}mundo`;
		const input = setupAtEnd(text);
		input.handleInput(wordLeft);
		input.handleInput("|");
		expect(input.getValue()).toBe(`Hola${nbsp}|mundo`);
	});

	it("keeps common joiners inside words", () => {
		{
			const text = "co-operate l’été";
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("co-operate |l’été");
		}

		{
			const text = "co-operate l’été";
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("|co-operate l’été");
		}
	});

	it("recognizes Unicode punctuation as delimiter blocks", () => {
		{
			const text = "¿Cómo estás? ¡Muy bien!";
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("¿Cómo estás? ¡Muy bien|!");
		}

		{
			const text = "¿Cómo estás? ¡Muy bien!";
			const input = setupAtEnd(text);
			input.handleInput(wordLeft);
			input.handleInput(wordLeft);
			input.handleInput("|");
			expect(input.getValue()).toBe("¿Cómo estás? ¡Muy |bien!");
		}
	});
});
