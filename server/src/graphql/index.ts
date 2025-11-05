import { readFileSync } from "fs";
import path from "path";

const rootDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/root.graphql"),
  { encoding: "utf-8" }
);
const userDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/user.graphql"),
  { encoding: "utf-8" }
);
const ngoDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/ngo.graphql"),
  { encoding: "utf-8" }
);
const eventDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/event.graphql"),
  { encoding: "utf-8" }
);
const signupDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/signup.graphql"),
  { encoding: "utf-8" }
);
const badgeDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/badge.graphql"),
  { encoding: "utf-8" }
);
const branchDefs = readFileSync(
  path.join(process.cwd(), "src/graphql/schemas/branch.graphql"),
  { encoding: "utf-8" }
);

// Combine and export them
export const typeDefs = `${rootDefs}\n${userDefs}\n${ngoDefs}\n${eventDefs}\n${signupDefs}\n${badgeDefs}\n${branchDefs}`;
