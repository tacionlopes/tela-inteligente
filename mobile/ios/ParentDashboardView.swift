import SwiftUI

struct RoundResult: Identifiable {
    let id = UUID()
    let score: Int
    let correctAnswers: Int
    let totalQuestions: Int
    let createdAt: Date
}

final class ResultRepository: ObservableObject {
    static let shared = ResultRepository()
    @Published private(set) var results: [RoundResult] = []

    func save(score: Int, correctAnswers: Int, totalQuestions: Int) {
        results.insert(
            RoundResult(
                score: score,
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                createdAt: Date()
            ),
            at: 0
        )
    }
}

struct ParentDashboardView: View {
    @ObservedObject private var repository = ResultRepository.shared

    var body: some View {
        NavigationStack {
            List {
                Section("Resumo") {
                    LabeledContent("Última nota", value: lastScore)
                    LabeledContent("Rodadas", value: "\(repository.results.count)")
                }

                Section("Histórico") {
                    if repository.results.isEmpty {
                        Text("Nenhuma rodada respondida ainda.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(repository.results) { result in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(result.score)/10")
                                    .font(.headline)
                                Text("\(result.correctAnswers)/\(result.totalQuestions) corretas")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Responsável")
        }
    }

    private var lastScore: String {
        guard let result = repository.results.first else { return "--" }
        return "\(result.score)/10"
    }
}
