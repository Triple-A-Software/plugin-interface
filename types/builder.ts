import type { SchemaOutput } from "@aaa-soft/form-structure";
import type { Label } from "./general";

export type BuilderItem = {
    /**
     * An id used to identify this item in the builder
     */
    id: string;
    /**
     * The label to show to the user. Keys are the language (i.e. "de", "en"), value is the shown label in that language
     */
    label: Label;
    /**
     * An icon from https://icones.js.org/collection/tabler in the format "i-tabler-...-..."
     */
    icon: string;
    /**
     * A set of inputs users can use to modify the details of this item.
     */
    props: Array<SchemaOutput>;
    /**
     * The data structure the user can modify with the given props inputs
     */
    // biome-ignore lint/suspicious/noExplicitAny: Allowed here
    data: Record<string, any>;
    /**
     * A Handlebars template to define how this builderItem will be rendered
     */
    template: string;
};
