import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f8dt6v1z";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error("SANITY_API_WRITE_TOKEN required");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-06-30",
  useCdn: false,
  token,
});

const types = ["article", "hero", "player", "footer", "siteSettings", "pushyPanel", "modals", "matchResult", "season"];

async function main() {
  for (const type of types) {
    const ids: string[] = await client.fetch(`*[_type == $type]._id`, { type });
    if (ids.length === 0) {
      console.log(`No ${type} documents to delete`);
      continue;
    }
    console.log(`Deleting ${ids.length} ${type} document(s)...`);
    const tx = client.transaction();
    for (const id of ids) {
      tx.delete(id);
    }
    await tx.commit();
    console.log(`  Deleted ${ids.length} ${type} document(s)`);
  }
  console.log("Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
