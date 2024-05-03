import { definePlugin } from "../..";

// this function gets run on server start
export default definePlugin((ctx) => {
    // Register a form, which will be styled like the rest of the cms
    ctx.registerForm("main", {
        properties: [], // properties defined here, just like in element-types
    });

    // Register a serverside handler to handle API requests
    const formSubmitHandler = ctx.registerHandler(
        "submitForm",
        (data) => {
            console.log(data); // data is the input from the client
            return "Thank you for submitting the form!"; // this will be sent back to the client, so it should be serializable into a Response
        },
        {
            allowedRoles: ["admin", "developer", "public", "editor", "author"], // which roles are allowed to access this handler
        },
    );

    // register an element type preset, which will show up in the `new from template` dropdown when creating an element type
    ctx.registerElementType({}); // the parameter here should have the same schema as all predefined element-types
    // register a page layout preset
    ctx.registerPageLayout({}); // this parameter should have the same schema as all predefined page-layouts

    // hook into the plugin rewriter to modify the rendered html of pages
    ctx.onRewrite((rewriter) => {
        // rewriter is of type HTMLRewriter
        rewriter.on("div", {
            element(el) {},
        });
    });

    // register a dashboard widget
    ctx.registerWidget("my-widget", {}); // TODO: what is the schema here?

    // register a handlebars helper
    // the parameters are just the things handlebars wants when registering a helper
    ctx.registerHandlebarsHelper("form_stuff", (...attributes) => {
        return `<form ${attributes.join(" ")} onSubmit="${formSubmitHandler}"></form>`; // TODO: using the registered handler should be a little something like this
    });
});
