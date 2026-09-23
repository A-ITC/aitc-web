export type PromiseQueueState<Value> =
  | { status: "queued" | "loading" }
  | { status: "ready"; value: Value }
  | { status: "error"; error: unknown };

type QueueTask<Key, Value> = {
  key: Key;
  execute: (signal: AbortSignal) => Promise<Value>;
  promise: Promise<Value>;
  resolve: (value: Value) => void;
  reject: (error: unknown) => void;
  controller?: AbortController;
};

export class PromiseQueue<Key, Value> {
  private readonly cache = new Map<Key, Value>();
  private readonly pending = new Map<Key, QueueTask<Key, Value>>();
  private readonly queue: QueueTask<Key, Value>[] = [];
  private activeCount = 0;
  private disposed = false;

  constructor(
    private readonly concurrency: number,
    private readonly onStateChange?: (
      key: Key,
      state: PromiseQueueState<Value>,
    ) => void,
  ) {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new RangeError("PromiseQueue concurrency must be at least 1");
    }
  }

  request(
    key: Key,
    execute: (signal: AbortSignal) => Promise<Value>,
    priority = false,
  ): Promise<Value> {
    if (this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key) as Value);
    }

    const existing = this.pending.get(key);
    if (existing) {
      if (priority && !existing.controller) this.promote(existing);
      return existing.promise;
    }

    if (this.disposed) {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }

    let resolve!: (value: Value) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<Value>((nextResolve, nextReject) => {
      resolve = nextResolve;
      reject = nextReject;
    });
    const task = { key, execute, promise, resolve, reject };
    this.pending.set(key, task);
    if (priority) this.queue.unshift(task);
    else this.queue.push(task);
    this.onStateChange?.(key, { status: "queued" });
    this.pump();
    return promise;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const abortError = new DOMException("Aborted", "AbortError");
    this.queue.splice(0).forEach((task) => {
      this.pending.delete(task.key);
      task.reject(abortError);
    });
    this.pending.forEach((task) => task.controller?.abort());
    this.cache.clear();
  }

  private promote(task: QueueTask<Key, Value>) {
    const index = this.queue.indexOf(task);
    if (index <= 0) return;
    this.queue.splice(index, 1);
    this.queue.unshift(task);
  }

  private pump() {
    while (
      !this.disposed &&
      this.activeCount < this.concurrency &&
      this.queue.length > 0
    ) {
      const task = this.queue.shift();
      if (!task) return;
      this.start(task);
    }
  }

  private start(task: QueueTask<Key, Value>) {
    const controller = new AbortController();
    task.controller = controller;
    this.activeCount += 1;
    this.onStateChange?.(task.key, { status: "loading" });

    void Promise.resolve()
      .then(() => task.execute(controller.signal))
      .then((value) => {
        if (!this.disposed) {
          this.cache.set(task.key, value);
          this.onStateChange?.(task.key, { status: "ready", value });
        }
        task.resolve(value);
      })
      .catch((error: unknown) => {
        if (!this.disposed) {
          this.onStateChange?.(task.key, { status: "error", error });
        }
        task.reject(error);
      })
      .finally(() => {
        this.pending.delete(task.key);
        this.activeCount -= 1;
        this.pump();
      });
  }
}
