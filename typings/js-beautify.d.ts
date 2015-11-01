declare module 'js-beautify' {
	interface BeautifyOptions {
		indent_size?: number;
		indent_char?: string;
	}
	
	export function js_beautify(input: string, options?: BeautifyOptions): string;
}