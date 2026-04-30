import SwiftUI

struct EducationQuestion: Identifiable {
    let id = UUID()
    let year: String
    let age: Int
    let subject: String
    let text: String
    let alternatives: [String]
    let correctAnswer: String
    let level: String
    let timeSeconds: Int
}

struct EducationGateView: View {
    private let questions = QuestionRepository.defaultQuestions.prefix(5).map { $0 }
    @State private var currentIndex = 0
    @State private var correctAnswers = 0
    @State private var isUnlocked = false

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 18) {
                if isUnlocked {
                    Spacer()
                    Text("Tela liberada")
                        .font(.largeTitle.bold())
                    Text("Você acertou todas as questões da rodada.")
                        .foregroundStyle(.secondary)
                    Button("Nova rodada") {
                        restart()
                    }
                    .buttonStyle(.borderedProminent)
                    Spacer()
                } else {
                    let question = questions[currentIndex]

                    Text("\(question.year) ano • \(question.age) anos • \(question.subject)")
                        .font(.caption.bold())
                        .foregroundStyle(.teal)

                    HStack {
                        Text("Questão \(currentIndex + 1) de 5")
                            .font(.headline)
                        Spacer()
                        Text("\(score)/10")
                            .font(.headline.bold())
                    }

                    ProgressView(value: Double(currentIndex + 1), total: 5)

                    Text(question.text)
                        .font(.title.bold())
                        .minimumScaleFactor(0.8)

                    ForEach(Array(question.alternatives.enumerated()), id: \.offset) { index, option in
                        let letter = String(UnicodeScalar(65 + index)!)
                        Button {
                            answer(letter)
                        } label: {
                            HStack {
                                Text(letter)
                                    .font(.headline)
                                    .frame(width: 34, height: 34)
                                    .background(.primary)
                                    .foregroundStyle(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                Text(option)
                                    .font(.headline)
                                Spacer()
                            }
                            .padding()
                            .background(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(.gray.opacity(0.25), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }

                    Spacer()
                }
            }
            .padding()
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Desbloqueio Inteligente")
        }
    }

    private var score: Int {
        Int(round(Double(correctAnswers) / 5.0 * 10.0))
    }

    private func answer(_ letter: String) {
        let question = questions[currentIndex]
        if letter == question.correctAnswer {
            correctAnswers += 1
        }

        if currentIndex < 4 {
            currentIndex += 1
            return
        }

        ResultRepository.shared.save(score: score, correctAnswers: correctAnswers, totalQuestions: 5)
        isUnlocked = correctAnswers == 5

        if !isUnlocked {
            restart()
        }
    }

    private func restart() {
        currentIndex = 0
        correctAnswers = 0
        isUnlocked = false
    }
}
