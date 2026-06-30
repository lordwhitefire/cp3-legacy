export default {
  name: "modals",
  title: "Modals",
  type: "document",
  fields: [
    {
      name: "register",
      title: "Register Modal",
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        {
          name: "fields",
          title: "Fields",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "name", title: "Name", type: "string" },
                { name: "type", title: "Type", type: "string" },
                { name: "placeholder", title: "Placeholder", type: "string" },
                { name: "required", title: "Required", type: "boolean" },
              ],
            },
          ],
        },
        {
          name: "button",
          title: "Button",
          type: "object",
          fields: [
            { name: "text", title: "Text", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
        { name: "note", title: "Note", type: "text" },
      ],
    },
    {
      name: "login",
      title: "Login Modal",
      type: "object",
      fields: [
        { name: "title", title: "Title", type: "string" },
        {
          name: "fields",
          title: "Fields",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "name", title: "Name", type: "string" },
                { name: "type", title: "Type", type: "string" },
                { name: "placeholder", title: "Placeholder", type: "string" },
                { name: "required", title: "Required", type: "boolean" },
              ],
            },
          ],
        },
        { name: "rememberMe", title: "Remember Me Text", type: "string" },
        {
          name: "forgotPassword",
          title: "Forgot Password",
          type: "object",
          fields: [
            { name: "text", title: "Text", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
        {
          name: "button",
          title: "Button",
          type: "object",
          fields: [
            { name: "text", title: "Text", type: "string" },
          ],
        },
        {
          name: "socialLogin",
          title: "Social Login",
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            {
              name: "items",
              title: "Items",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "icon", title: "Icon", type: "string" },
                    { name: "url", title: "URL", type: "url" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
