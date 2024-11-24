class CircularBuffer {
    constructor(size) {
        this.size = size;
        this.buffer = new Array(size);
        this.currentIndex = 0;
        this.isFull = false;
    }

    push(item) {
        this.buffer[this.currentIndex] = item;
        this.currentIndex = (this.currentIndex + 1) % this.size;
        if (this.currentIndex === 0) {
            this.isFull = true;
        }
    }

    toArray() {
        if (!this.isFull) {
            return this.buffer.slice(0, this.currentIndex);
        }
        const end = this.buffer.slice(0, this.currentIndex);
        const start = this.buffer.slice(this.currentIndex);
        return [...start, ...end];
    }
}

module.exports = CircularBuffer;
