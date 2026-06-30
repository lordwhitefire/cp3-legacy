export default {
  name: "pushyPanel",
  title: "Pushy Panel",
  type: "document",
  fields: [
    {
      name: "logo",
      title: "Logo",
      type: "object",
      fields: [
        { name: "src", title: "Image", type: "image" },
        { name: "alt", title: "Alt Text", type: "string" },
      ],
    },
    {
      name: "posts",
      title: "Posts",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "image", title: "Image", type: "image" },
            { name: "category", title: "Category", type: "string" },
            { name: "title", title: "Title", type: "string" },
            { name: "date", title: "Date", type: "string" },
          ],
        },
      ],
    },
    {
      name: "tagCloud",
      title: "Tag Cloud",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
      ],
    },
    {
      name: "banner",
      title: "Banner",
      type: "object",
      fields: [
        { name: "image", title: "Image", type: "image" },
        { name: "url", title: "URL", type: "url" },
      ],
    },
  ],
};
