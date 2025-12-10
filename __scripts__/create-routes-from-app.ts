import fs from "fs";
import path from "path";
import jscodeshift from "jscodeshift";

const basicRoutes = {
    login: "LoginForm",
    studios: "PublicStudiosDirectory",
    ceramics: "PublicCeramicsMarketplace",
    journal: "PotteryJournal",
    blog: "BlogManagement",
    whiteboard: "WhiteboardEditor",
    marketplace: "CommerceMarketplace",
    settings: "Settings",
    events: "EventsManagement",
    messages: "MessagingCenter",
    members: "MemberManagement",
    staff: "StaffManagement",
    kilns: "KilnManagement",
    glazes: "GlazeManagement",
    invites: "InvitesPanel",
    mystudios: "MyStudios",
    calendar: "CalendarPage",
    products: "Products",
    documents: "StudioDocuments",
    feed: "Feed",
    mudlyai: "MudlyAI"
};

const j = jscodeshift.withParser("tsx");

for (const [route, component] of Object.entries(basicRoutes)) {
    const componentFile = path.join("src", "components", component + ".tsx");
    const routeFile = path.join("src", "app", route, "page.tsx");

    updateImports(componentFile);
    // moveFile(component, route, componentFile, routeFile);
}

/**
 *
 * "./ui/...." to "@/components/ui/..."
 */
function updateImports(componentFile: string) {
    const updatedContent = j(fs.readFileSync(componentFile, "utf-8"))
        .find(j.ImportDeclaration, {
            source: {
                value: (value: string) => value.startsWith(".")
            }
        })
        .forEach((p) => {
            const oldImport = p.node.source.value;
            const newImport =
            console.log(`updating import in ${componentFile}: ${p.node.source.value}`);
        })
        .toSource();

    // fs.writeFileSync(componentFile, updatedContent, "utf-8");
}

function moveFile(
    componentName: string,
    routeName: string,
    componentFile: string,
    routeFile: string
) {
    console.log(`moving ${componentName} to route: /${routeName}/page.tsx`);

    if (!fs.existsSync(componentFile)) {
        console.warn(`Component file does not exist: ${componentFile}`);
        return;
    }

    // create route, make all subdirs
    fs.mkdirSync(path.dirname(routeFile), { recursive: true });

    // update export to be default
    const updatedContent = j(fs.readFileSync(componentFile, "utf-8"))
        .find(j.ExportNamedDeclaration, {
            declaration: {
                id: {
                    name: componentName
                }
            }
        })
        .forEach((p) => {
            if (
                p.node.declaration?.type === "FunctionDeclaration" &&
                p.node.declaration.id?.name === componentName
            ) {
                p.replace(j.exportDefaultDeclaration(p.node.declaration));
            }
        })
        .toSource();

    // move file
    fs.renameSync(componentFile, routeFile);
    fs.writeFileSync(routeFile, updatedContent, "utf-8");
}
// Special Cases:
// not loggedin
// return (
//     <LoginForm
//         onLogin={handleLogin}
//         onBack={() => setCurrentPage("landing")}
//     />
// );
// default:
//       return (
//           <div className="p-8">
//               <h1>Loading...</h1>
//           </div>
//       );
// case "dashboard":
//       return context.currentUser.activeMode === "studio" && context.currentStudio ? (
//           <StudioDashboard />
//       ) : (
//           <DashboardMockup />
//       );
// case "classes":
//       return context.currentUser.activeMode === "studio" && context.currentStudio ? (
//           <ClassesManagement />
//       ) : (
//           <ArtistClasses />
//       );
//   default:
//     return <LandingPage onNavigate={setCurrentPage} />;

//   case "profile":
//       return (
//           <ArtistProfile
//               onProfileUpdated={(updated) => context.setCurrentUser(updated)}
//           />
//       );

//   case "verifyphone":
//       return (
//           <VerifyPhonePage
//               onDone={() =>
//                   setCurrentPage(
//                       context.currentUser?.activeMode === "studio"
//                           ? "dashboard"
//                           : "profile"
//                   )
//               }
//           />
//       ); -->
