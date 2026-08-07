// AssetLoader — Lazy-load heavy assets for mobile
// Breaks large files into chunked, on-demand loading

class AssetLoader {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 1024 * 1024; // 1MB chunks
    this.cache = new Map();
    this.loading = new Map();
  }

  // Load asset on demand
  async load(src) {
    if (this.cache.has(src)) {
      return this.cache.get(src);
    }
    
    if (this.loading.has(src)) {
      return this.loading.get(src);
    }
    
    const promise = this._fetchWithProgress(src);
    this.loading.set(src, promise);
    
    try {
      const data = await promise;
      this.cache.set(src, data);
      this.loading.delete(src);
      return data;
    } catch (err) {
      this.loading.delete(src);
      throw err;
    }
  }

  // Fetch with progress tracking
  async _fetchWithProgress(src) {
    const response = await fetch(src);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${src}: ${response.status}`);
    }
    
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    // For small assets, just return text
    if (total < this.chunkSize) {
      return response.text();
    }
    
    // For large assets, stream in chunks
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      received += value.length;
      
      // Emit progress event
      if (total > 0) {
        const progress = (received / total) * 100;
        this._emitProgress(src, progress, received, total);
      }
    }
    
    // Combine chunks
    const allChunks = new Uint8Array(received);
    let position = 0;
    
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }
    
    return new TextDecoder().decode(allChunks);
  }

  _emitProgress(src, percent, loaded, total) {
    window.dispatchEvent(new CustomEvent('asset-progress', {
      detail: { src, percent, loaded, total }
    }));
  }

  // Preload critical assets
  preload(sources) {
    return Promise.all(sources.map(src => this.load(src)));
  }

  // Clear cache
  clear() {
    this.cache.clear();
  }
}

// Global instance
window.assetLoader = new AssetLoader();
