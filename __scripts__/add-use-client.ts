import fs from "fs";
import path from "path";
import jscodeshift from "jscodeshift";

const tsxFiles = fs.globSync(path.join("src", "**", "*.tsx"));
const j = jscodeshift.withParser("tsx");

for (const file of tsxFiles) {
    const fileContent = fs.readFileSync(file, "utf-8");
    const root = j(fileContent);

    // if file alredy has use client, skip
    if (
        root
            .find(j.DirectiveLiteral, {
                value: "use client"
            })
            .size() > 0
    ) {
        console.log(`Skipping ${file}, already has "use client" directive.`);
        continue;
    }

    // if file use useState, add
    if (
        root
            .find(j.ImportDeclaration, {
                specifiers: [{
                    imported: { name: "useState" }
                }]
            })
            .size() > 0
    ) {
        root.find(j.Program).forEach((programPath) => {
            programPath.node.directives = programPath.node.directives ?? [];
            programPath.node.directives.unshift(
                j.directive(j.directiveLiteral("use client"))
            );
        });

        fs.writeFileSync(file, root.toSource(), "utf-8");
    }
}
