# Desbloqueio Inteligente Mobile

Este diretório organiza a versão mobile do produto em Android e iPhone.

## Android

Formato recomendado:

- App nativo Kotlin.
- `EducationOverlayService` exibe a cobertura educativa sobre outros apps.
- Necessita permissão `SYSTEM_ALERT_WINDOW`.
- Pode usar Usage Access para decidir quando mostrar a rodada educativa.
- O responsável vê os resultados no painel do próprio app.

Limite importante: o usuário precisa conceder permissão de sobreposição nas configurações do Android, e o sistema pode impedir overlays sobre telas críticas.

## iPhone

Formato recomendado:

- App nativo SwiftUI.
- Integração com Screen Time usando FamilyControls, ManagedSettings e DeviceActivity.
- O iOS não permite overlay livre sobre qualquer app de terceiros.
- A experiência educativa deve ser acionada dentro das regras de Screen Time.

## Regra do desbloqueio

- Rodada com no máximo 5 perguntas.
- Cada pergunta tem 3 alternativas.
- Pontuação de 0 a 10.
- Só libera quando fizer 10/10.
- O resultado fica disponível para pais ou responsáveis.
