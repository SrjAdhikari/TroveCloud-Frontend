//* tests/lib/loadedImage.ts

/**
 * Radix treats an image as loaded only when `complete && naturalWidth > 0`,
 * which jsdom never satisfies, so AvatarImage renders no <img> at all and the
 * src can't be asserted. This stub reports every src as loaded — install it
 * with `vi.stubGlobal("Image", LoadedImage)`.
 */
class LoadedImage {
	complete = false;
	naturalWidth = 0;
	#src = "";

	addEventListener() {}

	removeEventListener() {}

	get src() {
		return this.#src;
	}

	set src(value: string) {
		this.#src = value;
		this.complete = true;
		this.naturalWidth = 1;
	}
}

export default LoadedImage;
