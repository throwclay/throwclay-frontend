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
