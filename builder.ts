import type { BuilderItem } from "./types/builder";

export function label() {
    const label: Record<string, string> = {};
    type LabelBuilder = {
        build(): Record<string, string>;
    } & Record<string, (v: string) => LabelBuilder>;
    const proxy = new Proxy({} as LabelBuilder, {
        get(_target, prop: string, _receiver) {
            if (prop === "build") {
                return () => label;
            }
            return (v: string): LabelBuilder => {
                label[prop] = v;
                return proxy;
            };
        },
    });
    return proxy;
}

export function builderItem(item: BuilderItem) {
    return item;
}
