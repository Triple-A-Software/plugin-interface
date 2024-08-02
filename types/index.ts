import type { SchemaOutput } from "@aaa-soft/form-structure";
import type { Label } from "./general";
import type { Hookable } from "hookable";

export type PluginMetadata = {
    name: string;
    version: string;
    files: Array<string>;
    build?: string;
} & (ServiceMetadata | ModuleMetadata);

type ServiceMetadata = {
    type: "service";
    bin: string;
    routes?: Record<string, { type: "page" | "api" | "file", layout?: { name: string, slot: string } }>
    env?: Record<string, string>
}

type ModuleMetadata = {
    type: "module";
    main: string;
}

export type Plugin = (cms: PluginHooks) => void | Promise<void>;

export type Action = {
    primary?: boolean;
    tooltip?: Record<string, string>;
    label: Label;
    handler: ActionHandler;
};

export type ActionHandler = {
    method: string;
    url: string;
    redirect?: string;
};

type FormSettingsPage = {
    type: "form";
    form: SchemaOutput;
    actions: Action[];
    getDataHandler: ActionHandler;
};
export type ListSettingsPage = {
    type: "list";
    getDataHandler: ActionHandler;
    columns: Array<{
        key: string;
        label: Label;
    }>;
    actions: {
        icon: string;
        showModal?: boolean;
        to?: string; // with {{}} interpolation (example: '/admin/posts/{{record.id}}/edit?id={{record.id}}')
        handler?: {
            url: string; // with {{}} interpolation (example: '/admin/posts/{{record.id}}/edit?id={{record.id}}')
            method: string;
            body?: string; // with {{}} interpolation (example: '{"id": "{{record.id}}"}', '{{record}}')
        };
    }[];
};

export type SettingsPage = {
    label: Label;
} & (FormSettingsPage | ListSettingsPage);

export type RewriteHandler = (rewriter: HTMLRewriter) => void;
export type ServerHandler = {
    methods: string[];
    handler: (data: HandlerParam) => MaybePromise<IntoResponse>;
    options?: {
        allowedRoles?: ("admin" | "developer" | "editor" | "author" | "public")[];
    };
};
export type Widget = Record<string, unknown>;
export type ElementType = {
    name: string;
    icon: string;
    template: string;
    script: string;
    style: string;
    form: SchemaOutput;
    category: "text" | "design" | "interactive" | "layout" | "misc" | "media";
};
export type PageLayout = {
    name: string;
    icon: string;
    template: string;
    script: string;
    style: string;
};
export type HandlebarsHelper = {
    name: string;
    fn: (...args: unknown[]) => unknown;
};
type HandlerParam = {
    //biome-ignore lint/suspicious/noExplicitAny: TODO: narrow this type
    body: any;
    //biome-ignore lint/suspicious/noExplicitAny: TODO: narrow this type
    query: any;
    method: string;
    //biome-ignore lint/suspicious/noExplicitAny: TODO: narrow this type
    params?: Record<string, any> | undefined;
};
export type RegisterHandlerReturn = {
    methods: string[];
    urlPath: string;
    toFormAttributes: (method?: string) => string;
    toActionHandler: (method?: string) => ActionHandler;
};
export type DataEntry<T = unknown> = {
    id: number;
    pluginId: string;
    data: T;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    deletedBy?: string | null;
};

type IntoResponse = string | Response | Record<string, unknown> | unknown[];
type MaybePromise<T> = T | Promise<T>;

// TODO: improve pluginhooks layout, maybe put all functions intended to be used in setup of the plugin into an `init` key,
// and all functions intended to be used at runtime into a `runtime` key
export type PluginHooks = {
    /**
     * Get the id of this plugin
     */
    pluginId(): string;
    /**
     * Send an e-mail with the mailer instance of the CMS
     * @param title of the Mail
     * @param to Recipient of the mail
     * @param mail body of the mail
     */
    sendMail: (title: string, to: string, mail: string) => Promise<void>;
    /**
     * Register a page shown in the settings tab of your plugin.
     * @param id unique id of the settings page
     * @param data JSON-Structure that defines the input data
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registersettingspage for more information
     */
    registerSettingsPage: (path: string, data: SettingsPage) => void;
    /**
     * Register an API-Endpoint on the server.
     * @param methods http methods on which the endpoint should listen
     * @param path http url of the endpoint should start with "/"
     * @param handler function that is run on the server
     * @param options optional parameters
     * @returns a helper object to easily use this endpoint in the rest of your plugin
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registerhandler for more information
     */
    registerHandler: (
        methods: string[],
        path: string,
        handler: (data: HandlerParam) => MaybePromise<IntoResponse>,
        options?: {
            /**
             * Which roles should be able to access this api endpoint?
             * If you want to define an endpoint for your admin-ui integration, this should be not set to an empty array and not include "public".
             */
            allowedRoles?: ("admin" | "developer" | "editor" | "author" | "public")[];
        },
    ) => RegisterHandlerReturn; // TODO: this return value should allow the plugin author to easily access this handler in the code of his plugin, what should this be?
    /**
     * HTML-Rewriter to manipulate the DOM, which is rendered on the Website.
     * @see https://docs.simpl-cms.de/plugins/defineplugin/onrewrite for more information
     * @see https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/ for more information
     */
    onRewrite: (handler: RewriteHandler) => void;
    /**
     * Register a widget component which will be displayed in the dashboard menu of the admin panel.
     * @param id unique id of the registered Widget
     * @param widget JSON-Structure of the Widget
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registerwidget for more information
     */
    registerWidget: (id: string, widget: Widget) => void;
    /**
     * Register an element-type. It will be available to the user through the `new from template` button.
     * @param data JSON-Structure of the Elementtype
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registerelementtype for more information
     */
    registerElementType: (data: ElementType) => void;
    /**
     * Register a page layout. It will be available to the user through the `new from template` button.
     * @param data the page-layout definition
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registerpagelayout for more information
     */
    registerPageLayout: (data: PageLayout) => void;
    /**
     * Register a new Handlebarshelper, that will be accessible in your template script.
     * @param name the Name under which the handlebarshelper is accessed
     * @param fn callback which is executed if the name is matched in the website Renderer
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registerhandlebarshelper for more information
     */
    registerHandlebarsHelper: (name: string, fn: (...args: unknown[]) => void) => void;
    /**
     * Register a public file to be available in the client.
     * @param filename the path to the file relative to the public folder of your plugin
     * @returns the full path to access this file from a client
     * @see https://docs.simpl-cms.de/plugins/defineplugin/registerpublicfile for more information
     */
    registerPublicFile: (filename: string) => string;
    /**
     * Use the Hookable instance of the CMS instance to trigger actions and react to events.
     * You should only use this, if the other available functions on `ctx` don't do what you want.
     * @see https://unjs.io/packages/hookable for more information on usage
     */
    hooks: Hookable; // TODO: maybe specify the available events here
    /**
     * Outputs information in the console of the CMS-Instance.
     * @see https://docs.simpl-cms.de/plugins/defineplugin/logger for more information
     */
    logger: {
        //biome-ignore lint/suspicious/noExplicitAny: This is intentional
        info: (...args: any[]) => void;
        //biome-ignore lint/suspicious/noExplicitAny: This is intentional
        error: (...args: any[]) => void;
        //biome-ignore lint/suspicious/noExplicitAny: This is intentional
        debug: (...args: any[]) => void;
        //biome-ignore lint/suspicious/noExplicitAny: This is intentional
        warn: (...args: any[]) => void;
    };
    /**
     * CRUD operations for the plugin data table in the database
     * @see https://docs.simpl-cms.de/plugins/defineplugin/storage for more information
     */
    storage: {
        /**
         * Returns all data of the Plugin, stored in the database
         * @see https://docs.simpl-cms.de/plugins/defineplugin/storage/getall for more information
         */
        getAll<T = unknown>(): Promise<DataEntry<T>[]>;
        /**
         * Returns all data of the Plugin, where the given filter is a key
         * @param filter Key of the root Object of the DataEntry. ex "foo" to return `{ "foo": ... }` but not `{ "bar": ... }`
         */
        getAllWithFilter<T = unknown>(filter: string): Promise<DataEntry<T>[] | undefined>;
        /**
         * Returns one row of data with the given id, stored in the database
         * @params id primary key of the plugin data table in the database, is returend by createOne()
         * @see https://docs.simpl-cms.de/plugins/defineplugin/storage/getOne for more information
         */
        getOne<T = unknown>(id: number): Promise<DataEntry<T> | undefined>;
        /**
         * Updated data with given key of the Plugin, stored on the database.
         * @params id primary key of the plugin data table in the database, is returend by createOne()
         * @params value data to update
         * @see https://docs.simpl-cms.de/plugins/defineplugin/storage/updateone for more information
         */
        updateOne<T = unknown>(id: number, value: unknown): Promise<DataEntry<T> | undefined>;
        /**
         * Creates an Entry in the Database with Plugin name as identifier
         * @params value data to create
         * @returns the stored data and the database id, so it can be accessed later if needed
         * @see https://docs.simpl-cms.de/plugins/defineplugin/storage/createone for more information
         */
        createOne<T = unknown>(value: unknown): Promise<DataEntry<T> | undefined>;
        /**
         * deletes one Database entry with the given key
         * @params key unique id to identify which row was deleted
         * @see https://docs.simpl-cms.de/plugins/defineplugin/storage/deleteone for more information
         */
        deleteOne(key: number): Promise<{ id: number } | undefined>;
    };
};
