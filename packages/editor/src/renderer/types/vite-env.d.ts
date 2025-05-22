/// <reference types="vite/client" />

/**
 * Type definitions for Vite's import.meta.glob functionality
 */
interface ImportMeta {
  readonly env: Record<string, string>;
  readonly hot?: {
    readonly data: any;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: readonly string[], cb: (mods: any[]) => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
  glob(pattern: string, options?: { eager?: boolean }): Record<string, () => Promise<any>>;
}
