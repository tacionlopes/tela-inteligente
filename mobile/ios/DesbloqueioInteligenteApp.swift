import SwiftUI

@main
struct DesbloqueioInteligenteApp: App {
    var body: some Scene {
        WindowGroup {
            AppRootView()
        }
    }
}

struct AppRootView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            EducationGateView()
                .tabItem { Label("Criança", systemImage: "graduationcap.fill") }
                .tag(0)

            ParentDashboardView()
                .tabItem { Label("Responsável", systemImage: "person.2.fill") }
                .tag(1)
        }
    }
}
